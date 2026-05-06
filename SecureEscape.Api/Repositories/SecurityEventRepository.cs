using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class SecurityEventRepository : ISecurityEventRepository
{
    private readonly AppDbContext _context;

    public SecurityEventRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SecurityEvent securityEvent)
    {
        await _context.SecurityEvents.AddAsync(securityEvent);
        await _context.SaveChangesAsync();
    }
}
