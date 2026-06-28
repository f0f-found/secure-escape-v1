using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface INotificationDispatchService
{
    Task<NotificationAttemptResponseDto?> DispatchAsync(Guid notificationAttemptId);
    Task<List<NotificationAttemptResponseDto>> DispatchPendingAsync();
}