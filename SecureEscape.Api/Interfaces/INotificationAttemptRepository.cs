using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface INotificationAttemptRepository
{
    Task AddAsync(NotificationAttempt notificationAttempt);
}