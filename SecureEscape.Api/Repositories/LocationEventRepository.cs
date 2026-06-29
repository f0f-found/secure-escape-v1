using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class LocationEventRepository : ILocationEventRepository
{
    private readonly AppDbContext _context;

    public LocationEventRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(LocationEvent locationEvent)
    {
        await _context.LocationEvents.AddAsync(locationEvent);
    }

    public async Task<Guid?> GetOpenAlertIdForSessionAsync(Guid userSessionId)
    {
        return await _context.Alerts
            .Where(alert =>
                alert.UserSessionId == userSessionId &&
                alert.Status == AlertStatus.Open)
            .Select(alert => (Guid?)alert.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<List<LocationEvent>> GetBySessionIdAsync(Guid userSessionId)
    {
        return await _context.LocationEvents
            .AsNoTracking()
            .Where(location => location.UserSessionId == userSessionId)
            .OrderBy(location => location.CapturedAt)
            .ToListAsync();
    }

    public async Task<LocationEvent?> GetLatestBySessionIdAsync(Guid userSessionId)
    {
        return await _context.LocationEvents
            .AsNoTracking()
            .Where(location => location.UserSessionId == userSessionId)
            .OrderByDescending(location => location.CapturedAt)
            .FirstOrDefaultAsync();
    }
}