using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class UserSessionRepository : IUserSessionRepository
{
    private readonly AppDbContext _context;

    public UserSessionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserSession>> GetDuressSessionsAsync(Guid? bankIntegrationId)
    {
        var query = _context.UserSessions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Alerts)
            .Where(x => x.Mode == SessionMode.Duress)
            .AsQueryable();

        if (bankIntegrationId.HasValue)
        {
            query = query.Where(x => x.User!.BankIntegrationId == bankIntegrationId.Value);
        }

        return await query
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync();
    }

    public async Task<UserSession?> GetDuressSessionDetailAsync(Guid sessionId)
    {
        return await _context.UserSessions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Alerts)
                .ThenInclude(x => x.NotificationAttempts)
            .Include(x => x.AlertActions)
                .ThenInclude(x => x.AdminUser)
            .Include(x => x.Transactions)
            .Include(x => x.LocationEvents)
            .FirstOrDefaultAsync(x => x.Id == sessionId && x.Mode == SessionMode.Duress);
    }

    public async Task<UserSession?> GetByIdAsync(Guid sessionId)
    {
        return await _context.UserSessions
            .FirstOrDefaultAsync(x => x.Id == sessionId);
    }

    public async Task AddActionAsync(AlertAction alertAction)
    {
        await _context.AlertActions.AddAsync(alertAction);
    }

    public async Task UpdateAsync(UserSession session)
    {
        _context.UserSessions.Update(session);
        await Task.CompletedTask;
    }
}