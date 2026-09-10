using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using SecureEscape.Api.Services;
using Xunit;

namespace SecureEscape.Api.Tests;

public class AuthServiceTests
{
    // Every test gets its own isolated in-memory database so tests can't bleed into each other.
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static (User user, AuthCredential credential) SeedActiveUser(AppDbContext context)
    {
        var bankIntegration = new BankIntegration
        {
            Id = Guid.NewGuid(),
            BankName = "Test Bank",
            BankCode = "TB001",
            Status = BankIntegrationStatus.Active
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            BankIntegrationId = bankIntegration.Id,
            BankCustomerId = "CUST-0001",
            FullName = "Test User",
            Email = "test.user@example.com",
            PhoneNumber = "0820000000",
            Status = UserStatus.Active
        };

        var credential = new AuthCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PasswordHash = "PASSWORD_HASH",
            NormalPinHash = "NORMAL_HASH",
            DuressPinHash = "DURESS_HASH"
        };

        context.BankIntegrations.Add(bankIntegration);
        context.Users.Add(user);
        context.AuthCredentials.Add(credential);
        context.SaveChanges();

        return (user, credential);
    }

    // Builds an AuthService with every dependency mocked except the real (in-memory) DbContext.
    // hashingSetup lets each test control which PIN "verifies" against which hash.
    private static AuthService BuildService(
        AppDbContext context,
        AuthCredential credential,
        string enteredPin,
        bool normalPinMatches,
        bool duressPinMatches,
        out Mock<IAuditService> auditMock,
        out Mock<INotificationDispatchService> notificationDispatchMock)
    {
        var hashingMock = new Mock<IHashingService>();
        hashingMock.Setup(x => x.Verify(enteredPin, credential.NormalPinHash)).Returns(normalPinMatches);
        hashingMock.Setup(x => x.Verify(enteredPin, credential.DuressPinHash)).Returns(duressPinMatches);

        var tokenMock = new Mock<ITokenService>();
        tokenMock.Setup(x => x.CreateToken(It.IsAny<User>(), It.IsAny<UserSession>())).Returns("fake-jwt-token");

        auditMock = new Mock<IAuditService>();
        auditMock.SetReturnsDefault(Task.CompletedTask);

        var riskMock = new Mock<IRiskService>();
        riskMock.Setup(x => x.AssessDuressLogin()).Returns(new RiskAssessmentResult
        {
            Score = 0.95m,
            RiskLevel = RiskLevel.High,
            Reason = "Duress PIN matched"
        });

        var emergencyContactRepoMock = new Mock<IEmergencyContactRepository>();
        emergencyContactRepoMock.Setup(x => x.GetAllByUserIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<EmergencyContact>());

        notificationDispatchMock = new Mock<INotificationDispatchService>();
        notificationDispatchMock.SetReturnsDefault(Task.CompletedTask);

        var currentUserMock = new Mock<ICurrentUserService>(); // unused by LoginAsync, needed for constructor only

        return new AuthService(
            context,
            hashingMock.Object,
            tokenMock.Object,
            auditMock.Object,
            riskMock.Object,
            emergencyContactRepoMock.Object,
            currentUserMock.Object,
            notificationDispatchMock.Object);
    }

    [Fact]
    public async Task LoginAsync_CorrectNormalPin_ReturnsNormalSessionAndNoDuressSignal()
    {
        // Arrange
        using var context = CreateContext();
        var (user, credential) = SeedActiveUser(context);

        var service = BuildService(
            context, credential, enteredPin: "1234",
            normalPinMatches: true, duressPinMatches: false,
            out var auditMock, out var notificationDispatchMock);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Pin = "1234",
            IpAddress = "127.0.0.1",
            DeviceInfo = "unit-test-device"
        };

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result!.IsDuress.Should().BeFalse();
        result.SessionMode.Should().Be(SessionMode.Normal.ToString());

        // No duress alert should ever be raised for a normal login.
        (await context.Alerts.CountAsync()).Should().Be(0);
        notificationDispatchMock.Verify(
            x => x.DispatchPendingForSessionAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_CorrectDuressPin_ReturnsDuressSessionAndRaisesAlert()
    {
        // Arrange
        using var context = CreateContext();
        var (user, credential) = SeedActiveUser(context);

        var service = BuildService(
            context, credential, enteredPin: "9999",
            normalPinMatches: false, duressPinMatches: true,
            out var auditMock, out var notificationDispatchMock);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Pin = "9999",
            IpAddress = "127.0.0.1",
            DeviceInfo = "unit-test-device"
        };

        // Act
        var result = await service.LoginAsync(request);

        // Assert — this is the core "does the silent alarm actually fire" behavior.
        result.Should().NotBeNull();
        result!.IsDuress.Should().BeTrue();
        result.SessionMode.Should().Be(SessionMode.Duress.ToString());

        var alert = await context.Alerts.SingleOrDefaultAsync();
        alert.Should().NotBeNull();
        alert!.Type.Should().Be(AlertType.DuressLogin);

        notificationDispatchMock.Verify(
            x => x.DispatchPendingForSessionAsync(result.UserSessionId), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WrongPin_ReturnsNullWithoutCreatingSessionOrAlert()
    {
        // Arrange
        using var context = CreateContext();
        var (user, credential) = SeedActiveUser(context);

        var service = BuildService(
            context, credential, enteredPin: "0000",
            normalPinMatches: false, duressPinMatches: false,
            out var auditMock, out var notificationDispatchMock);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Pin = "0000",
            IpAddress = "127.0.0.1",
            DeviceInfo = "unit-test-device"
        };

        // Act
        var result = await service.LoginAsync(request);

        // Assert — wrong PIN must look identical whether or not a duress PIN exists;
        // it should just fail cleanly with no session or alert created.
        result.Should().BeNull();
        (await context.UserSessions.CountAsync()).Should().Be(0);
        (await context.Alerts.CountAsync()).Should().Be(0);
    }
}