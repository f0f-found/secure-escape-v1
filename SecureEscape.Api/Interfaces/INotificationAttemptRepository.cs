using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface INotificationAttemptRepository
{
    Task AddAsync(NotificationAttempt notificationAttempt);
    Task<NotificationAttempt?> GetByIdAsync(Guid id);
    Task<List<NotificationAttempt>> GetPendingAsync();
    Task<List<NotificationAttempt>> GetPendingBySessionIdAsync(Guid userSessionId);
}