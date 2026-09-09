using FluentAssertions;
using Moq;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using SecureEscape.Api.Services;
using Xunit;

namespace SecureEscape.Api.Tests;

// NOTE: IFraudReportingService wasn't in the files shared with me, so
// ReportDuressTransactionAsync's return type is assumed to be a class named
// FraudReportResult with { bool Reported, DateTime? ReportedAt, string? Reference }.
// If your actual type differs, only the FraudReportResult references below need updating.
public class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _transactionRepo = new();
    private readonly Mock<IBankAccountRepository> _bankAccountRepo = new();
    private readonly Mock<IBeneficiaryRepository> _beneficiaryRepo = new();
    private readonly Mock<IDecoyProfileRepository> _decoyProfileRepo = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly Mock<IAuditService> _auditService = new();
    private readonly Mock<IAlertRepository> _alertRepo = new();
    private readonly Mock<IRiskEvaluationRepository> _riskEvaluationRepo = new();
    private readonly Mock<INotificationAttemptRepository> _notificationAttemptRepo = new();
    private readonly Mock<IEmergencyContactRepository> _emergencyContactRepo = new();
    private readonly Mock<IRiskService> _riskService = new();
    private readonly Mock<IFraudReportingService> _fraudReportingService = new();
    private readonly Mock<ILocationEventRepository> _locationEventRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _userSessionId = Guid.NewGuid();
    private readonly Guid _bankAccountId = Guid.NewGuid();
    private readonly Guid _beneficiaryId = Guid.NewGuid();

    private TransactionService BuildService(BankAccount account, Beneficiary beneficiary, DecoyProfile decoyProfile)
    {
        _currentUserService.Setup(x => x.GetCurrentUser()).Returns(new CurrentUserContext
        {
            UserId = _userId,
            UserSessionId = _userSessionId,
            SessionMode = SessionMode.Duress,
            BankIntegrationId = Guid.NewGuid(),
            Email = "test.user@example.com",
            FullName = "Test User"
        });

        _bankAccountRepo.Setup(x => x.GetByIdForUserAsync(_bankAccountId, _userId)).ReturnsAsync(account);
        _bankAccountRepo.Setup(x => x.UpdateAsync(It.IsAny<BankAccount>())).Returns(Task.CompletedTask);

        _beneficiaryRepo.Setup(x => x.GetByIdForUserAsync(_beneficiaryId, _userId)).ReturnsAsync(beneficiary);

        _decoyProfileRepo.Setup(x => x.GetActiveByUserIdAsync(_userId)).ReturnsAsync(decoyProfile);
        _decoyProfileRepo.Setup(x => x.UpdateAsync(It.IsAny<DecoyProfile>())).Returns(Task.CompletedTask);

        _transactionRepo.Setup(x => x.AddAsync(It.IsAny<BankTransaction>())).Returns(Task.CompletedTask);

        _riskService.Setup(x => x.AssessDuressTransaction(It.IsAny<BankTransaction>(), It.IsAny<DecoyProfile>()))
            .Returns(new RiskAssessmentResult
            {
                Score = 0.75m,
                RiskLevel = RiskLevel.High,
                Reason = "Duress transaction within emergency profile"
            });

        _fraudReportingService
            .Setup(x => x.ReportDuressTransactionAsync(It.IsAny<BankTransaction>(), _userId, _userSessionId))
            .ReturnsAsync(new FraudReportResult
            {
                Reported = true,
                ReportedAt = DateTime.UtcNow,
                Reference = "FR-TEST-0001"
            });

        _locationEventRepo.Setup(x => x.GetLatestBySessionIdAsync(_userSessionId)).ReturnsAsync((LocationEvent?)null);
        _emergencyContactRepo.Setup(x => x.GetAllByUserIdAsync(_userId)).ReturnsAsync(new List<EmergencyContact>());

        _alertRepo.Setup(x => x.AddAsync(It.IsAny<Alert>())).Returns(Task.CompletedTask);
        _riskEvaluationRepo.Setup(x => x.AddAsync(It.IsAny<RiskEvaluation>())).Returns(Task.CompletedTask);
        _notificationAttemptRepo.Setup(x => x.AddAsync(It.IsAny<NotificationAttempt>())).Returns(Task.CompletedTask);
        _auditService.SetReturnsDefault(Task.CompletedTask);
        _unitOfWork.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        return new TransactionService(
            _transactionRepo.Object,
            _bankAccountRepo.Object,
            _beneficiaryRepo.Object,
            _decoyProfileRepo.Object,
            _currentUserService.Object,
            _auditService.Object,
            _alertRepo.Object,
            _riskEvaluationRepo.Object,
            _notificationAttemptRepo.Object,
            _emergencyContactRepo.Object,
            _riskService.Object,
            _fraudReportingService.Object,
            _locationEventRepo.Object,
            _unitOfWork.Object);
    }

    private BankAccount BuildAccount(decimal availableBalance) => new()
    {
        Id = _bankAccountId,
        UserId = _userId,
        AccountNumber = "4009009009",
        AccountName = "Duress Test Account",
        AccountType = AccountType.Savings,
        AvailableBalance = availableBalance,
        CurrentBalance = availableBalance,
        Currency = "ZAR",
        Status = AccountStatus.Active
    };

    private Beneficiary BuildBeneficiary() => new()
    {
        Id = _beneficiaryId,
        UserId = _userId,
        Name = "Test Beneficiary",
        BankName = "Test Bank",
        AccountNumber = "5009009009",
        Reference = "Test",
        Status = BeneficiaryStatus.Active
    };

    [Fact]
    public async Task CreateAsync_DuressSession_AmountWithinDecoyBudget_ApprovesAsDecoyAndDecrementsBudget()
    {
        // Arrange — R18,500 available, but the decoy profile's emergency budget (R2,000)
        // is the real ceiling in a duress session, per Math.Min(EmergencyBudget, AvailableBalance).
        var account = BuildAccount(availableBalance: 18_500m);
        var beneficiary = BuildBeneficiary();
        var decoyProfile = new DecoyProfile
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            ProfileType = DecoyProfileType.LowProfile,
            DisplayBalance = 2_000m,
            EmergencyBudget = 2_000m,
            Tier1Limit = 500m,
            Tier2Limit = 5_000m,
            IsActive = true
        };

        var service = BuildService(account, beneficiary, decoyProfile);

        var request = new CreateTransactionRequestDto
        {
            BankAccountId = _bankAccountId,
            BeneficiaryId = _beneficiaryId,
            Amount = 1_500m,
            Description = "Emergency withdrawal"
        };

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        result.Status.Should().Be(TransactionStatus.DecoyApproved);
        result.SecureEscapeCode.Should().NotBeNullOrEmpty();
        decoyProfile.EmergencyBudget.Should().Be(500m); // 2000 - 1500
        account.AvailableBalance.Should().Be(17_000m);  // 18500 - 1500, real balance still moves
    }

    [Fact]
    public async Task CreateAsync_DuressSession_AmountExceedsDecoyBudget_FailsWithoutSecureEscapeCode()
    {
        // Arrange — plenty of real balance, but the decoy's emergency budget is the ceiling that matters.
        var account = BuildAccount(availableBalance: 18_500m);
        var beneficiary = BuildBeneficiary();
        var decoyProfile = new DecoyProfile
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            ProfileType = DecoyProfileType.LowProfile,
            DisplayBalance = 2_000m,
            EmergencyBudget = 2_000m,
            Tier1Limit = 500m,
            Tier2Limit = 5_000m,
            IsActive = true
        };

        var service = BuildService(account, beneficiary, decoyProfile);

        var request = new CreateTransactionRequestDto
        {
            BankAccountId = _bankAccountId,
            BeneficiaryId = _beneficiaryId,
            Amount = 5_000m, // exceeds the R2,000 emergency budget
            Description = "Attempted large withdrawal"
        };

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        result.Status.Should().Be(TransactionStatus.Failed);
        result.StatusReason.Should().Be("Insufficient funds.");
        result.SecureEscapeCode.Should().BeNullOrEmpty();
        decoyProfile.EmergencyBudget.Should().Be(2_000m); // untouched — nothing should be deducted on failure
        account.AvailableBalance.Should().Be(18_500m);    // untouched
    }
}