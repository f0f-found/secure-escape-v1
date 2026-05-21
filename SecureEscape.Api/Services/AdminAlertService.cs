using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AdminAlertService : IAdminAlertService
{
    private readonly IAlertRepository _alertRepository;
    private readonly IAuditService _auditService;

    public AdminAlertService(
        IAlertRepository alertRepository,
        IAuditService auditService)
    {
        _alertRepository = alertRepository;
        _auditService = auditService;
    }

    public async Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status = null)
    {
        var alerts = await _alertRepository.GetAllAsync(status);

        return alerts.Select(MapToSummary).ToList();
    }

    public async Task<AlertDetailResponseDto?> GetAlertByIdAsync(Guid alertId)
    {
        var alert = await _alertRepository.GetDetailByIdAsync(alertId);

        if (alert == null)
        {
            return null;
        }

        return MapToDetail(alert);
    }

    public async Task<bool> UpdateAlertStatusAsync(Guid alertId, UpdateAlertStatusRequestDto request)
    {
        var alert = await _alertRepository.GetByIdAsync(alertId);

        if (alert == null)
        {
            return false;
        }

        alert.Status = request.Status;

        if (request.Status == AlertStatus.Resolved || request.Status == AlertStatus.FalseAlarm)
        {
            alert.ResolvedAt = DateTime.UtcNow;
        }

        await _alertRepository.UpdateAsync(alert);

        var action = new AlertAction
        {
            Id = Guid.NewGuid(),
            AlertId = alert.Id,
            ActionType = request.Status == AlertStatus.Resolved
                ? AlertActionType.Resolved
                : AlertActionType.Assigned,
            Notes = string.IsNullOrWhiteSpace(request.Notes)
                ? $"Alert status updated to {request.Status}."
                : request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _alertRepository.AddActionAsync(action);

        await _auditService.LogAsync(
            AuditEventType.AlertStatusUpdated,
            entityType: "Alert",
            entityId: alert.Id,
            userId: alert.UserId,
            userSessionId: alert.UserSessionId,
            metadataJson: $"{{\"status\":\"{request.Status}\"}}");

        return true;
    }

    public async Task<bool> AddAlertActionAsync(Guid alertId, CreateAlertActionRequestDto request)
    {
        var alert = await _alertRepository.GetByIdAsync(alertId);

        if (alert == null)
        {
            return false;
        }

        var action = new AlertAction
        {
            Id = Guid.NewGuid(),
            AlertId = alert.Id,
            ActionType = request.ActionType,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _alertRepository.AddActionAsync(action);

        await _auditService.LogAsync(
            AuditEventType.AlertStatusUpdated,
            entityType: "AlertAction",
            entityId: action.Id,
            userId: alert.UserId,
            userSessionId: alert.UserSessionId,
            metadataJson: $"{{\"actionType\":\"{request.ActionType}\"}}");

        return true;
    }

    private static AlertSummaryResponseDto MapToSummary(Alert alert)
    {
        return new AlertSummaryResponseDto
        {
            Id = alert.Id,
            UserId = alert.UserId,
            UserSessionId = alert.UserSessionId,
            CustomerName = alert.User?.FullName ?? string.Empty,
            CustomerEmail = alert.User?.Email ?? string.Empty,
            Type = alert.Type,
            Severity = alert.Severity,
            Status = alert.Status,
            Description = alert.Description,
            CreatedAt = alert.CreatedAt,
            ResolvedAt = alert.ResolvedAt
        };
    }

    private static AlertDetailResponseDto MapToDetail(Alert alert)
    {
        return new AlertDetailResponseDto
        {
            Id = alert.Id,
            UserId = alert.UserId,
            UserSessionId = alert.UserSessionId,
            CustomerName = alert.User?.FullName ?? string.Empty,
            CustomerEmail = alert.User?.Email ?? string.Empty,
            CustomerPhoneNumber = alert.User?.PhoneNumber ?? string.Empty,
            Type = alert.Type,
            Severity = alert.Severity,
            Status = alert.Status,
            Description = alert.Description,
            CreatedAt = alert.CreatedAt,
            ResolvedAt = alert.ResolvedAt,
            SessionMode = alert.UserSession?.Mode.ToString() ?? string.Empty,
            SessionStatus = alert.UserSession?.Status.ToString() ?? string.Empty,
            IpAddress = alert.UserSession?.IpAddress ?? string.Empty,
            DeviceInfo = alert.UserSession?.DeviceInfo ?? string.Empty,
            SessionStartedAt = alert.UserSession?.StartedAt ?? DateTime.MinValue,
            Locations = alert.LocationEvents
                .OrderByDescending(x => x.CapturedAt)
                .Select(MapToLocation)
                .ToList(),
            Transactions = alert.UserSession?.Transactions
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapToTransaction)
                .ToList() ?? new List<AlertTransactionResponseDto>(),
            Actions = alert.AlertActions
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapToAction)
                .ToList(),
            NotificationAttempts = alert.NotificationAttempts
                .OrderByDescending(x => x.CreatedAt)
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
            Flagged = transaction.Flagged,
            RiskLevel = transaction.RiskLevel,
            RiskScore = transaction.RiskScore,
            Description = transaction.Description,
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