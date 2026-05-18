using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class DecoyProfileRepository : IDecoyProfileRepository
{
    private readonly AppDbContext _context;

    public DecoyProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DecoyProfile?> GetActiveByUserIdAsync(Guid userId)
    {
        return await _context.DecoyProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.IsActive);
    }

    public async Task<DecoyProfile?> GetByIdForUserAsync(Guid decoyProfileId, Guid userId)
    {
        return await _context.DecoyProfiles
            .FirstOrDefaultAsync(x => x.Id == decoyProfileId && x.UserId == userId);
    }

    public async Task AddAsync(DecoyProfile decoyProfile)
    {
        await _context.DecoyProfiles.AddAsync(decoyProfile);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(DecoyProfile decoyProfile)
    {
        _context.DecoyProfiles.Update(decoyProfile);
        await _context.SaveChangesAsync();
    }
}