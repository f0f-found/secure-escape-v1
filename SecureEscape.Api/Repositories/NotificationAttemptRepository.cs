using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

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
}