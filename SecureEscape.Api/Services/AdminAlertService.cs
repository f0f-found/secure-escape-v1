using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AdminAlertService : IAdminAlertService
{
    private readonly IAlertRepository _alertRepository;
    private readonly IAuditService _auditService;
    private readonly IUnitOfWork _unitOfWork;

    public AdminAlertService(
        IAlertRepository alertRepository,
        IAuditService auditService,
        IUnitOfWork unitOfWork)
    {
        _alertRepository = alertRepository;
        _auditService = auditService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status, Guid? bankIntegrationId)
    {
        var alerts = await _alertRepository.GetAllAsync(status, bankIntegrationId);
        return alerts.Select(MapToSummary).ToList();
    }

    public async Task<AlertDetailResponseDto?> GetAlertDetailAsync(
        Guid alertId,
        Guid? bankIntegrationId)
    {
        var alert = await _alertRepository.GetDetailByIdAsync(alertId, bankIntegrationId);

        if (alert == null)
        {
            return null;
        }

        return MapToDetail(alert);
    }

    public async Task<bool> UpdateAlertStatusAsync(
        Guid alertId,
        UpdateAlertStatusRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId)
    {
        var alert = await _alertRepository.GetByIdAsync(alertId);

        if (alert == null)
        {
            return false;
        }

        var detail = await _alertRepository.GetDetailByIdAsync(alertId, bankIntegrationId);

        if (detail == null)
        {
            return false;
        }

        alert.Status = request.Status;

        if (request.Status == AlertStatus.Resolved ||
            request.Status == AlertStatus.FalseAlarm)
        {
            alert.ResolvedAt = DateTime.UtcNow;
        }

        await _alertRepository.UpdateAsync(alert);
        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.AlertStatusUpdated,
            entityType: "Alert",
            entityId: alert.Id,
            userId: alert.UserId,
            userSessionId: alert.UserSessionId,
            adminUserId: adminUserId,
            metadataJson:
                $"{{\"status\":\"{request.Status}\",\"notes\":\"{request.Notes}\"}}");

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
        var session = alert.UserSession;

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
            SessionMode = session?.Mode.ToString() ?? string.Empty,
            SessionStatus = session?.Status.ToString() ?? string.Empty,
            IpAddress = session?.IpAddress ?? string.Empty,
            DeviceInfo = session?.DeviceInfo ?? string.Empty,
            SessionStartedAt = session?.StartedAt ?? DateTime.MinValue,
            Locations = session?.LocationEvents
                .OrderBy(x => x.CapturedAt)
                .Select(x => new AlertLocationResponseDto
                {
                    Id = x.Id,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    AccuracyMeters = x.AccuracyMeters,
                    LocationSource = x.LocationSource,
                    CapturedAt = x.CapturedAt,
                    CreatedAt = x.CreatedAt
                })
                .ToList() ?? new List<AlertLocationResponseDto>(),
            Transactions = session?.Transactions
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AlertTransactionResponseDto
                {
                    Id = x.Id,
                    BankAccountId = x.BankAccountId,
                    BeneficiaryId = x.BeneficiaryId,
                    BankReference = x.BankReference,
                    TransactionType = x.TransactionType,
                    Amount = x.Amount,
                    Currency = x.Currency,
                    Status = x.Status,
                    StatusReason = x.StatusReason,
                    Flagged = x.Flagged,
                    RiskLevel = x.RiskLevel,
                    RiskScore = x.RiskScore,
                    Description = x.Description,
                    SecureEscapeCode = x.SecureEscapeCode,
                    CreatedAt = x.CreatedAt
                })
                .ToList() ?? new List<AlertTransactionResponseDto>(),
            Actions = session?.AlertActions
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AlertActionResponseDto
                {
                    Id = x.Id,
                    AdminUserId = x.AdminUserId,
                    AdminName = x.AdminUser?.FullName ?? string.Empty,
                    ActionType = x.ActionType,
                    Notes = x.Notes,
                    CreatedAt = x.CreatedAt
                })
                .ToList() ?? new List<AlertActionResponseDto>(),
            NotificationAttempts = alert.NotificationAttempts
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new NotificationAttemptResponseDto
                {
                    Id = x.Id,
                    Channel = x.Channel,
                    Destination = x.Destination,
                    MessageBody = x.MessageBody,
                    Status = x.Status,
                    ErrorMessage = x.ErrorMessage,
                    AttemptedAt = x.AttemptedAt,
                    SentAt = x.SentAt,
                    ResponseMessage = x.ResponseMessage,
                    CreatedAt = x.CreatedAt
                })
                .ToList()
        };
    }
}