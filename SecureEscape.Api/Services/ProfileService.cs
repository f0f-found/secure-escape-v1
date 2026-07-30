using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProfileService(
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ProfileResponseDto> GetCurrentProfileAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == currentUser.UserId);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User no longer exists.");
        }

        return new ProfileResponseDto
        {
            Id = user.Id,
            BankIntegrationId = user.BankIntegrationId,
            BankCustomerId = user.BankCustomerId,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Status = user.Status,
            UserSessionId = currentUser.UserSessionId,
            SessionMode = currentUser.SessionMode
        };
    }
}