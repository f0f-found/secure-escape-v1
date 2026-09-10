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

// Mirrors TransactionServiceTests.cs but for the SessionMode.Normal branch, where
// ProcessNormalTransaction runs instead of ProcessDuressTransactionAsync — no decoy
// profile, no alerts, no fraud reporting, no SecureEscapeCode.
public class TransactionServiceNormalPathTests
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

    private TransactionService BuildService(BankAccount account, Beneficiary beneficiary)
    {
        _currentUserService.Setup(x => x.GetCurrentUser()).Returns(new CurrentUserContext
        {
            UserId = _userId,
            UserSessionId = _userSessionId,
            SessionMode = SessionMode.Normal,
            BankIntegrationId = Guid.NewGuid(),
            Email = "test.user@example.com",
            FullName = "Test User"
        });

        _bankAccountRepo.Setup(x => x.GetByIdForUserAsync(_bankAccountId, _userId)).ReturnsAsync(account);
        _bankAccountRepo.Setup(x => x.UpdateAsync(It.IsAny<BankAccount>())).Returns(Task.CompletedTask);

        _beneficiaryRepo.Setup(x => x.GetByIdForUserAsync(_beneficiaryId, _userId)).ReturnsAsync(beneficiary);

        _transactionRepo.Setup(x => x.AddAsync(It.IsAny<BankTransaction>())).Returns(Task.CompletedTask);

        _riskService.Setup(x => x.AssessNormalTransaction(It.IsAny<BankTransaction>()))
            .Returns(new RiskAssessmentResult
            {
                Score = 0.20m,
                RiskLevel = RiskLevel.Low,
                Reason = "Normal transaction"
            });

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
        AccountNumber = "4001001001",
        AccountName = "Normal Test Account",
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
        AccountNumber = "5001001001",
        Reference = "Test",
        Status = BeneficiaryStatus.Active
    };

    [Fact]
    public async Task CreateAsync_NormalSession_SufficientFunds_ApprovesAndDeductsRealBalance()
    {
        // Arrange
        var account = BuildAccount(availableBalance: 10_000m);
        var beneficiary = BuildBeneficiary();
        var service = BuildService(account, beneficiary);

        var request = new CreateTransactionRequestDto
        {
            BankAccountId = _bankAccountId,
            BeneficiaryId = _beneficiaryId,
            Amount = 2_500m,
            Description = "Rent payment"
        };

        // Act
        var result = await service.CreateAsync(request);

        // Assert — normal transactions are the real thing: real balance moves,
        // status is plain Approved, and there is no SecureEscapeCode at all.
        result.Status.Should().Be(TransactionStatus.Approved);
        result.SecureEscapeCode.Should().BeNullOrEmpty();
        account.AvailableBalance.Should().Be(7_500m);
        account.CurrentBalance.Should().Be(7_500m);

        _bankAccountRepo.Verify(x => x.UpdateAsync(account), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_NormalSession_InsufficientFunds_ThrowsAndLeavesBalanceUntouched()
    {
        // Arrange
        var account = BuildAccount(availableBalance: 500m);
        var beneficiary = BuildBeneficiary();
        var service = BuildService(account, beneficiary);

        var request = new CreateTransactionRequestDto
        {
            BankAccountId = _bankAccountId,
            BeneficiaryId = _beneficiaryId,
            Amount = 2_500m, // exceeds the R500 available balance
            Description = "Attempted overdraft"
        };

        // Act
        var act = async () => await service.CreateAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Insufficient funds.");

        account.AvailableBalance.Should().Be(500m); // untouched
        _bankAccountRepo.Verify(x => x.UpdateAsync(It.IsAny<BankAccount>()), Times.Never);
    }
}