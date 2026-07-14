using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Services;

public class AdminAuthService : IAdminAuthService
{
    private readonly AppDbContext _context;
    private readonly IHashingService _hashingService;
    private readonly ITokenService _tokenService;

    public AdminAuthService(
        AppDbContext context,
        IHashingService hashingService,
        ITokenService tokenService)
    {
        _context = context;
        _hashingService = hashingService;
        _tokenService = tokenService;
    }

    public async Task<AdminLoginResponseDto?> LoginAsync(AdminLoginRequestDto request)
    {
        var adminUser = await _context.AdminUsers
            .Include(x => x.BankIntegration)
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (adminUser == null ||
        adminUser.ActivityStatus != AdminUserStatus.Active)
        {
            return null;
        }

        if (adminUser.BankIntegration != null &&
            adminUser.BankIntegration.Status != BankIntegrationStatus.Active)
        {
            return null;
        }

        var passwordValid = _hashingService.Verify(request.Password, adminUser.PasswordHash);

        if (!passwordValid) return null;

        var token = _tokenService.CreateAdminToken(adminUser);

        return new AdminLoginResponseDto
        {
            AdminUserId = adminUser.Id,
            FullName = adminUser.FullName,
            Email = adminUser.Email,
            AdminRole = adminUser.AdminRole.ToString(),
            BankName = adminUser.BankIntegration?.BankName ?? string.Empty,
            Token = token
        };
    }


}