using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class RiskZoneRepository : IRiskZoneRepository
{
    private readonly AppDbContext _context;

    public RiskZoneRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<RiskZone>> GetActiveAsync()
    {
        return await _context.RiskZones
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.RiskScore)
            .ThenBy(x => x.Name)
            .ToListAsync();
    }
}