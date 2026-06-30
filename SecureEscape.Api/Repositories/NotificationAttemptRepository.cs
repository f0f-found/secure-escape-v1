using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Repositories;

public class NotificationAttemptRepository : INotificationAttemptRepository
{
    private readonly AppDbContext _context;

    public NotificationAttemptRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(NotificationAttempt notificationAttempt)
    {
        await _context.NotificationAttempts.AddAsync(notificationAttempt);

    }

    public async Task<NotificationAttempt?> GetByIdAsync(Guid id)
    {
        return await _context.NotificationAttempts
            .FirstOrDefaultAsync(notificationAttempt => notificationAttempt.Id == id);
    }

    public async Task<List<NotificationAttempt>> GetPendingAsync()
    {
        return await _context.NotificationAttempts
            .Where(notificationAttempt =>
                notificationAttempt.Status == NotificationStatus.Pending ||
                notificationAttempt.Status == NotificationStatus.Retrying)
            .OrderBy(notificationAttempt => notificationAttempt.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<NotificationAttempt>> GetPendingBySessionIdAsync(Guid userSessionId)
    {
        return await _context.NotificationAttempts
            .Include(notificationAttempt => notificationAttempt.Alert)
            .Where(notificationAttempt =>
                notificationAttempt.Alert != null &&
                notificationAttempt.Alert.UserSessionId == userSessionId &&
                (
                    notificationAttempt.Status == NotificationStatus.Pending ||
                    notificationAttempt.Status == NotificationStatus.Retrying
                ))
            .OrderBy(notificationAttempt => notificationAttempt.CreatedAt)
            .ToListAsync();
    }
}