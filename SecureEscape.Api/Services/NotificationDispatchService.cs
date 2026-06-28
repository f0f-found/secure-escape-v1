using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class NotificationDispatchService : INotificationDispatchService
{
    private readonly INotificationAttemptRepository _notificationAttemptRepository;
    private readonly IAuditService _auditService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationDispatchService(
        INotificationAttemptRepository notificationAttemptRepository,
        IAuditService auditService,
        IUnitOfWork unitOfWork)
    {
        _notificationAttemptRepository = notificationAttemptRepository;
        _auditService = auditService;
        _unitOfWork = unitOfWork;
    }

    public async Task<NotificationAttemptResponseDto?> DispatchAsync(Guid notificationAttemptId)
    {
        var attempt = await _notificationAttemptRepository.GetByIdAsync(notificationAttemptId);

        if (attempt == null)
        {
            return null;
        }

        return await DispatchAttemptAsync(attempt);
    }

    public async Task<List<NotificationAttemptResponseDto>> DispatchPendingAsync()
    {
        var pendingAttempts = await _notificationAttemptRepository.GetPendingAsync();

        var results = new List<NotificationAttemptResponseDto>();

        foreach (var attempt in pendingAttempts)
        {
            var result = await DispatchAttemptAsync(attempt);
            results.Add(result);
        }

        return results;
    }

    private async Task<NotificationAttemptResponseDto> DispatchAttemptAsync(
        NotificationAttempt attempt)
    {
        try
        {
            // Temporary simulated provider. Replace this later with real SMS/email/webhook logic.
            attempt.Status = NotificationStatus.Sent;
            attempt.SentAt = DateTime.UtcNow;
            attempt.ResponseMessage = $"Simulated {attempt.Channel} notification delivered.";
            attempt.ErrorMessage = string.Empty;

            await _auditService.LogAsync(
                AuditEventType.NotificationSent,
                entityType: "NotificationAttempt",
                entityId: attempt.Id,
                metadataJson:
                    $"{{\"channel\":\"{attempt.Channel}\",\"destination\":\"{attempt.Destination}\"}}");

            await _unitOfWork.SaveChangesAsync();

            return MapToResponse(attempt);
        }
        catch (Exception ex)
        {
            attempt.Status = NotificationStatus.Failed;
            attempt.ErrorMessage = ex.Message;
            attempt.ResponseMessage = string.Empty;

            await _auditService.LogAsync(
                AuditEventType.NotificationFailed,
                entityType: "NotificationAttempt",
                entityId: attempt.Id,
                metadataJson:
                    $"{{\"channel\":\"{attempt.Channel}\",\"destination\":\"{attempt.Destination}\",\"error\":\"{ex.Message}\"}}");

            await _unitOfWork.SaveChangesAsync();

            return MapToResponse(attempt);
        }
    }

    private static NotificationAttemptResponseDto MapToResponse(
        NotificationAttempt attempt)
    {
        return new NotificationAttemptResponseDto
        {
            Id = attempt.Id,
            Channel = attempt.Channel,
            Destination = attempt.Destination,
            Status = attempt.Status,
            ErrorMessage = attempt.ErrorMessage,
            AttemptedAt = attempt.AttemptedAt,
            SentAt = attempt.SentAt,
            ResponseMessage = attempt.ResponseMessage,
            CreatedAt = attempt.CreatedAt
        };
    }
}