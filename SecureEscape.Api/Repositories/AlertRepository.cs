using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class AlertRepository : IAlertRepository
{
    private readonly AppDbContext _context;

    public AlertRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Alert>> GetAllAsync(AlertStatus? status, Guid? bankIntegrationId)
    {
        var query = _context.Alerts
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.UserSession)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        if (bankIntegrationId.HasValue)
            query = query.Where(x => x.User!.BankIntegrationId == bankIntegrationId.Value);

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<Alert?> GetByIdAsync(Guid alertId)
    {
        return await _context.Alerts
            .FirstOrDefaultAsync(x => x.Id == alertId);
    }

    public async Task AddAsync(Alert alert)
    {
        await _context.Alerts.AddAsync(alert);
    }

    public async Task UpdateAsync(Alert alert)
    {
        _context.Alerts.Update(alert);
        await Task.CompletedTask;
    }
}