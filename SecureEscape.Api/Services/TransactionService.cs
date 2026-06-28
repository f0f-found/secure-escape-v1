using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Migrations;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IBankAccountRepository _bankAccountRepository;
    private readonly IBeneficiaryRepository _beneficiaryRepository;
    private readonly IDecoyProfileRepository _decoyProfileRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditService _auditService;
    private readonly IAlertRepository _alertRepository;
    private readonly IRiskEvaluationRepository _riskEvaluationRepository;
    private readonly INotificationAttemptRepository _notificationAttemptRepository;
    private readonly IEmergencyContactRepository _emergencyContactRepository;
    private readonly IRiskService _riskService;
    private readonly IUnitOfWork _unitOfWork;

    public TransactionService(
        ITransactionRepository transactionRepository,
        IBankAccountRepository bankAccountRepository,
        IBeneficiaryRepository beneficiaryRepository,
        IDecoyProfileRepository decoyProfileRepository,
        ICurrentUserService currentUserService,
        IAuditService auditService,
        IAlertRepository alertRepository,
        IRiskEvaluationRepository riskEvaluationRepository,
        INotificationAttemptRepository notificationAttemptRepository,
        IEmergencyContactRepository emergencyContactRepository,
        IRiskService riskService,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _bankAccountRepository = bankAccountRepository;
        _beneficiaryRepository = beneficiaryRepository;
        _decoyProfileRepository = decoyProfileRepository;
        _currentUserService = currentUserService;
        _auditService = auditService;
        _alertRepository = alertRepository;
        _riskEvaluationRepository = riskEvaluationRepository;
        _notificationAttemptRepository = notificationAttemptRepository;
        _emergencyContactRepository = emergencyContactRepository;
        _riskService = riskService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TransactionResponseDto>> GetAllAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();
        var transactions = await _transactionRepository.GetByUserIdAsync(currentUser.UserId);
        return transactions.Select(MapToResponse).ToList();
    }

    public async Task<TransactionResponseDto> CreateAsync(CreateTransactionRequestDto request)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var account = await _bankAccountRepository.GetByIdForUserAsync(
            request.BankAccountId, currentUser.UserId);

        if (account == null)
            throw new InvalidOperationException("Account not found.");

        var beneficiary = await _beneficiaryRepository.GetByIdForUserAsync(
            request.BeneficiaryId, currentUser.UserId);

        if (beneficiary == null)
            throw new InvalidOperationException("Beneficiary not found.");

        var bankReference = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..24].ToUpper();

        var bankTransaction = new BankTransaction
        {
            Id = Guid.NewGuid(),
            UserId = currentUser.UserId,
            UserSessionId = currentUser.UserSessionId,
            BankAccountId = account.Id,
            BeneficiaryId = beneficiary.Id,
            BankReference = bankReference,
            TransactionType = TransactionType.Transfer,
            Amount = request.Amount,
            Currency = account.Currency,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        await _transactionRepository.AddAsync(bankTransaction);

        if (currentUser.SessionMode == SessionMode.Duress)
        {
            await ProcessDuressTransactionAsync(
                bankTransaction, account, currentUser.UserId, currentUser.UserSessionId);
        }
        else
        {
            ProcessNormalTransaction(bankTransaction, account);
            await _bankAccountRepository.UpdateAsync(account);
        }

        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.TransactionCreated,
            entityType: "BankTransaction",
            entityId: bankTransaction.Id,
            userId: currentUser.UserId,
            userSessionId: currentUser.UserSessionId,
            metadataJson: $"{{\"status\":\"{bankTransaction.Status}\",\"amount\":{bankTransaction.Amount}}}");

        bankTransaction.Beneficiary = beneficiary;

        return MapToResponse(bankTransaction);
    }

    //METHODS
    private void ProcessNormalTransaction(BankTransaction transaction, BankAccount account)
    {
        if (account.Status == AccountStatus.Frozen)
        throw new InvalidOperationException("Transaction could not be processed.");

        if (account.AvailableBalance < transaction.Amount)
            throw new InvalidOperationException("Insufficient funds.");

        account.AvailableBalance -= transaction.Amount;
        account.CurrentBalance -= transaction.Amount;
        account.UpdatedAt = DateTime.UtcNow;

        var riskAssessment = _riskService.AssessNormalTransaction(transaction);

        transaction.Status = TransactionStatus.Approved;
        transaction.RiskLevel = riskAssessment.RiskLevel;
        transaction.RiskScore = riskAssessment.Score;
    }

    private async Task ProcessDuressTransactionAsync(
        BankTransaction transaction,
        BankAccount account,
        Guid userId,
        Guid userSessionId)
    {
        if (account.Status == AccountStatus.Frozen)
        {
            transaction.Status = TransactionStatus.Blocked;
            transaction.StatusReason = "Account unavailable.";
            return;
        }
        
        var decoyProfile = await _decoyProfileRepository.GetActiveByUserIdAsync(userId);

        transaction.Flagged = true;

        var riskAssessment = _riskService.AssessDuressTransaction(
            transaction,
            decoyProfile);

        transaction.RiskLevel = riskAssessment.RiskLevel;
        transaction.RiskScore = riskAssessment.Score;

        if (decoyProfile == null)
        {

            if (transaction.Amount <= account.AvailableBalance)
            {
                account.AvailableBalance -= transaction.Amount;
                account.CurrentBalance -= transaction.Amount;
                account.UpdatedAt = DateTime.UtcNow;
                await _bankAccountRepository.UpdateAsync(account);

                transaction.Status = TransactionStatus.Approved;
                transaction.SecureEscapeCode = $"SE-{userSessionId:N}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            }
            else
            {
                transaction.Status = TransactionStatus.Failed;
                transaction.StatusReason = "Insufficient funds.";
            }
        }
        else if (decoyProfile.IsActive)
        {
            var decoyCeiling = Math.Min(decoyProfile.EmergencyBudget, account.AvailableBalance);

            if (transaction.Amount <= decoyCeiling)
            {
                account.AvailableBalance -= transaction.Amount;
                account.CurrentBalance -= transaction.Amount;
                decoyProfile.EmergencyBudget -= transaction.Amount;
                account.UpdatedAt = DateTime.UtcNow;
                decoyProfile.UpdatedAt = DateTime.UtcNow;

                await _bankAccountRepository.UpdateAsync(account);
                await _decoyProfileRepository.UpdateAsync(decoyProfile);

                transaction.Status = TransactionStatus.DecoyApproved;
                transaction.SecureEscapeCode = $"SE-{userSessionId:N}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            }
            else
            {
                transaction.Status = TransactionStatus.Failed;
                transaction.StatusReason = "Insufficient funds.";
            }
        }

        transaction.Flagged = true;
        transaction.FraudReported = transaction.Status != TransactionStatus.Blocked;

        if (transaction.FraudReported)
        {
            transaction.FraudReportedAt = DateTime.UtcNow;
            transaction.FraudReportReference = $"SABRIC-{Guid.NewGuid():N}"[..16].ToUpper();
        }


        var alert = new Alert
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            UserSessionId = userSessionId,
            Type = AlertType.DuressTransaction,
            Severity = transaction.RiskLevel,
            Status = AlertStatus.Open,
            Description = $"Duress transaction attempted: R{transaction.Amount} ({transaction.Status}).",
            CreatedAt = DateTime.UtcNow
        };

        await _alertRepository.AddAsync(alert);

        await _riskEvaluationRepository.AddAsync(new RiskEvaluation
        {
            Id = Guid.NewGuid(),
            UserSessionId = userSessionId,
            BankTransactionId = transaction.Id,
            Score = riskAssessment.Score,
            RiskLevel = riskAssessment.RiskLevel,
            ReasonsJson =
                $"{{\"reason\":\"{riskAssessment.Reason}\",\"status\":\"{transaction.Status}\",\"score\":{riskAssessment.Score},\"riskLevel\":\"{riskAssessment.RiskLevel}\"}}",
            CreatedAt = DateTime.UtcNow
        });

        await _notificationAttemptRepository.AddAsync(new NotificationAttempt
        {
            Id = Guid.NewGuid(),
            AlertId = alert.Id,
            Channel = NotificationChannel.Webhook,
            Destination = "Fraud team webhook",
            Status = NotificationStatus.Pending,
            AttemptedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        });

        var emergencyContacts = await _emergencyContactRepository
            .GetAllByUserIdAsync(userId);

        foreach (var contact in emergencyContacts)
        {
            await _notificationAttemptRepository.AddAsync(new NotificationAttempt
            {
                Id = Guid.NewGuid(),
                AlertId = alert.Id,
                Channel = NotificationChannel.Sms,
                Destination = contact.PhoneNumber,
                Status = NotificationStatus.Pending,
                AttemptedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                ResponseMessage = $"Emergency contact notification queued for {contact.FullName}."
            });
        }

        await _auditService.LogAsync(
            AuditEventType.AlertCreated,
            entityType: "Alert",
            entityId: alert.Id,
            userId: userId,
            userSessionId: userSessionId,
            metadataJson: $"{{\"type\":\"DuressTransaction\",\"status\":\"{transaction.Status}\"}}");
    }

    private static TransactionResponseDto MapToResponse(BankTransaction t) => new()
    {
        Id = t.Id,
        BankAccountId = t.BankAccountId,
        BeneficiaryId = t.BeneficiaryId,
        BeneficiaryName = t.Beneficiary?.Name,
        BankReference = t.BankReference,
        TransactionType = t.TransactionType,
        Amount = t.Amount,
        Currency = t.Currency,
        Status = t.Status,
        Description = t.Description,
        StatusReason = t.StatusReason,
        SecureEscapeCode = t.SecureEscapeCode,
        CreatedAt = t.CreatedAt
    };
}