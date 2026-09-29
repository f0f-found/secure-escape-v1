using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class SecureEscapeEnrollmentRepository
    : ISecureEscapeEnrollmentRepository
{
    private readonly AppDbContext _context;

    public SecureEscapeEnrollmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SecureEscapeEnrollment?> GetByUserIdAsync(Guid userId)
    {
        return await _context.SecureEscapeEnrollments
            .FirstOrDefaultAsync(x => x.UserId == userId);
    }

    public async Task AddAsync(SecureEscapeEnrollment enrollment)
    {
        await _context.SecureEscapeEnrollments.AddAsync(enrollment);
    }

    public Task UpdateAsync(SecureEscapeEnrollment enrollment)
    {
        var entry = _context.Entry(enrollment);

        if (entry.State == EntityState.Detached)
        {
            _context.SecureEscapeEnrollments.Update(enrollment);
        }

        return Task.CompletedTask;
    }
}