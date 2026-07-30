using System.Security.Claims;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public CurrentUserContext GetCurrentUser()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user == null || user.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("No authenticated user found.");
        }

        var userId = GetGuidClaim(user, ClaimTypes.NameIdentifier);
        var bankIntegrationId = GetGuidClaim(user, "bankIntegrationId");
        var userSessionId = GetGuidClaim(user, "userSessionId");

        var sessionModeValue = user.FindFirstValue("sessionMode");

        if (!Enum.TryParse<SessionMode>(sessionModeValue, out var sessionMode))
        {
            throw new UnauthorizedAccessException("Invalid session mode claim.");
        }

        return new CurrentUserContext
        {
            UserId = userId,
            BankIntegrationId = bankIntegrationId,
            UserSessionId = userSessionId,
            SessionMode = sessionMode,
            Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            FullName = user.FindFirstValue(ClaimTypes.Name) ?? string.Empty
        };
    }

    private static Guid GetGuidClaim(ClaimsPrincipal user, string claimType)
    {
        var value = user.FindFirstValue(claimType);

        if (!Guid.TryParse(value, out var result))
        {
            throw new UnauthorizedAccessException($"Missing or invalid claim: {claimType}");
        }

        return result;
    }
}