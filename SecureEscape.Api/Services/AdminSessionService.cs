using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AdminSessionService : IAdminSessionService
{
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly IAuditService _auditService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBankAccountRepository _bankAccountRepository;

    public AdminSessionService(
    IUserSessionRepository userSessionRepository,
    IBankAccountRepository bankAccountRepository,
    IAuditService auditService,
    IUnitOfWork unitOfWork)
    {
        _userSessionRepository = userSessionRepository;
        _bankAccountRepository = bankAccountRepository;
        _auditService = auditService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DuressSessionSummaryResponseDto>> GetDuressSessionsAsync(Guid? bankIntegrationId)
    {
        var sessions = await _userSessionRepository.GetDuressSessionsAsync(bankIntegrationId);
        return sessions.Select(MapToSummary).ToList();
    }

    public async Task<DuressSessionDetailResponseDto?> GetDuressSessionDetailAsync(Guid sessionId, Guid? bankIntegrationId)
    {
        var session = await _userSessionRepository.GetDuressSessionDetailAsync(sessionId);

        if (session == null) return null;

        if (bankIntegrationId.HasValue && session.User?.BankIntegrationId != bankIntegrationId.Value)
        {
            return null; // treat as not found
        }

        return MapToDetail(session);
    }

    public async Task<bool> UpdateCaseStatusAsync(
        Guid sessionId,
        UpdateCaseStatusRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId)
    {
        var session = await _userSessionRepository.GetByIdAsync(sessionId);

        if (session == null) return false;

        // re-fetch with User included to verify bank ownership
        var detail = await _userSessionRepository.GetDuressSessionDetailAsync(sessionId);

        if (bankIntegrationId.HasValue && detail?.User?.BankIntegrationId != bankIntegrationId.Value)
        {
            return false;
        }

        session.CaseStatus = request.CaseStatus;

        if (request.CaseStatus == CaseStatus.Resolved || request.CaseStatus == CaseStatus.FalseAlarm)
        {
            session.CaseResolvedAt = DateTime.UtcNow;
        }

        await _userSessionRepository.UpdateAsync(session);

        var action = new AlertAction
        {
            Id = Guid.NewGuid(),
            UserSessionId = session.Id,
            AdminUserId = adminUserId,
            ActionType = request.CaseStatus == CaseStatus.Resolved
                ? AlertActionType.Resolved
                : request.CaseStatus == CaseStatus.FalseAlarm
                    ? AlertActionType.MarkedFalseAlarm
                    : AlertActionType.Assigned,
            Notes = string.IsNullOrWhiteSpace(request.Notes)
                ? $"Case status updated to {request.CaseStatus}."
                : request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _userSessionRepository.AddActionAsync(action);

        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.AlertStatusUpdated,
            entityType: "UserSession",
            entityId: session.Id,
            userId: session.UserId,
            userSessionId: session.Id,
            adminUserId: adminUserId,
            metadataJson: $"{{\"caseStatus\":\"{request.CaseStatus}\"}}");

        return true;
    }

    public async Task<bool> AddCaseActionAsync(
        Guid sessionId,
        CreateCaseActionRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId)
    {
        var session = await _userSessionRepository.GetByIdAsync(sessionId);

        if (session == null) return false;

        var detail = await _userSessionRepository.GetDuressSessionDetailAsync(sessionId);

        if (bankIntegrationId.HasValue && detail?.User?.BankIntegrationId != bankIntegrationId.Value)
        {
            return false;
        }

        var action = new AlertAction
        {
            Id = Guid.NewGuid(),
            UserSessionId = session.Id,
            AdminUserId = adminUserId,
            ActionType = request.ActionType,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _userSessionRepository.AddActionAsync(action);

        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.AlertStatusUpdated,
            entityType: "AlertAction",
            entityId: action.Id,
            userId: session.UserId,
            userSessionId: session.Id,
            adminUserId: adminUserId,
            metadataJson: $"{{\"actionType\":\"{request.ActionType}\"}}");

        return true;
    }

    public async Task<bool> FreezeAccountAsync(Guid sessionId, Guid? bankIntegrationId, Guid adminUserId)
    {
        var session = await _userSessionRepository.GetDuressSessionDetailAsync(sessionId);

        if (session == null) return false;

        if (bankIntegrationId.HasValue && session.User?.BankIntegrationId != bankIntegrationId.Value)
            return false;

        var accounts = await _bankAccountRepository.GetByUserIdForAdminAsync(session.UserId);

        foreach (var account in accounts)
        {
            account.Status = AccountStatus.Frozen;
            account.UpdatedAt = DateTime.UtcNow;
            await _bankAccountRepository.UpdateAsync(account);
        }

        var action = new AlertAction
        {
            Id = Guid.NewGuid(),
            UserSessionId = session.Id,
            ActionType = AlertActionType.FrozeAccount,
            AdminUserId = adminUserId,
            Notes = $"All accounts frozen by fraud team at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC.",
            CreatedAt = DateTime.UtcNow
        };

        await _userSessionRepository.AddActionAsync(action);
        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.AccountFrozen,
            entityType: "BankAccount",
            userId: session.UserId,
            userSessionId: session.Id,
            adminUserId: adminUserId,
            metadataJson: $"{{\"accountCount\":{accounts.Count},\"frozenBy\":\"FraudTeam\"}}");

        return true;
    }

    private static DuressSessionSummaryResponseDto MapToSummary(UserSession session)
    {
        var highestSeverity = session.Alerts.Any()
            ? session.Alerts.Max(a => a.Severity)
            : RiskLevel.Low;

        return new DuressSessionSummaryResponseDto
        {
            Id = session.Id,
            UserId = session.UserId,
            CustomerName = session.User?.FullName ?? string.Empty,
            CustomerEmail = session.User?.Email ?? string.Empty,
            Status = session.Status,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            AlertCount = session.Alerts.Count,
            HighestSeverity = highestSeverity,
            AlertTypes = session.Alerts.Select(a => a.Type.ToString()).Distinct().ToList()
        };
    }

    private static DuressSessionDetailResponseDto MapToDetail(UserSession session)
    {
        return new DuressSessionDetailResponseDto
        {
            Id = session.Id,
            UserId = session.UserId,
            CustomerName = session.User?.FullName ?? string.Empty,
            CustomerEmail = session.User?.Email ?? string.Empty,
            CustomerPhoneNumber = session.User?.PhoneNumber ?? string.Empty,
            Mode = session.Mode,
            Status = session.Status,
            CaseStatus = session.CaseStatus,
            IpAddress = session.IpAddress,
            DeviceInfo = session.DeviceInfo,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            CaseResolvedAt = session.CaseResolvedAt,
            Alerts = session.Alerts
                .OrderByDescending(a => a.CreatedAt)
                .Select(MapToAlertLog)
                .ToList(),
            Transactions = session.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Select(MapToTransaction)
                .ToList(),
            Locations = session.LocationEvents
                .OrderByDescending(l => l.CapturedAt)
                .Select(MapToLocation)
                .ToList(),
            Actions = session.AlertActions
                .OrderByDescending(a => a.CreatedAt)
                .Select(MapToAction)
                .ToList()
        };
    }

    private static SessionAlertLogResponseDto MapToAlertLog(Alert alert)
    {
        return new SessionAlertLogResponseDto
        {
            Id = alert.Id,
            Type = alert.Type,
            Severity = alert.Severity,
            Description = alert.Description,
            CreatedAt = alert.CreatedAt,
            NotificationAttempts = alert.NotificationAttempts
                .OrderByDescending(n => n.CreatedAt)
                .Select(MapToNotificationAttempt)
                .ToList()
        };
    }

    private static AlertLocationResponseDto MapToLocation(LocationEvent location)
    {
        return new AlertLocationResponseDto
        {
            Id = location.Id,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            AccuracyMeters = location.AccuracyMeters,
            LocationSource = location.LocationSource,
            CapturedAt = location.CapturedAt,
            CreatedAt = location.CreatedAt
        };
    }

    private static AlertTransactionResponseDto MapToTransaction(BankTransaction transaction)
    {
        return new AlertTransactionResponseDto
        {
            Id = transaction.Id,
            BankAccountId = transaction.BankAccountId,
            BeneficiaryId = transaction.BeneficiaryId,
            BankReference = transaction.BankReference,
            TransactionType = transaction.TransactionType,
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            Status = transaction.Status,
            StatusReason = transaction.StatusReason,
            Flagged = transaction.Flagged,
            RiskLevel = transaction.RiskLevel,
            RiskScore = transaction.RiskScore,
            Description = transaction.Description,
            SecureEscapeCode = transaction.SecureEscapeCode,
            CreatedAt = transaction.CreatedAt
        };
    }

    private static AlertActionResponseDto MapToAction(AlertAction action)
    {
        return new AlertActionResponseDto
        {
            Id = action.Id,
            AdminUserId = action.AdminUserId,
            AdminName = action.AdminUser?.FullName ?? string.Empty,
            ActionType = action.ActionType,
            Notes = action.Notes,
            CreatedAt = action.CreatedAt
        };
    }

    private static NotificationAttemptResponseDto MapToNotificationAttempt(NotificationAttempt attempt)
    {
        return new NotificationAttemptResponseDto
        {
            Id = attempt.Id,
            Channel = attempt.Channel,
            Destination = attempt.Destination,
            Status = attempt.Status,
            ErrorMessage = attempt.ErrorMessage,
            AttemptedAt = attempt.AttemptedAt,
            CreatedAt = attempt.CreatedAt
        };
    }
}