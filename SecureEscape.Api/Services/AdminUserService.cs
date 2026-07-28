using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services;

public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _context;

    public AdminUserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminUserSummaryResponseDto>> GetAnalystsAsync(Guid? bankIntegrationId)
    {
        var query = _context.AdminUsers
            .Where(x => x.AdminRole == AdminRole.FraudAnalyst
                && x.ActivityStatus == AdminUserStatus.Active);

        if (bankIntegrationId.HasValue)
        {
            query = query.Where(x => x.BankIntegrationId == bankIntegrationId.Value);
        }

        return await query
            .Select(x => new AdminUserSummaryResponseDto
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email
            })
            .ToListAsync();
    }
}