using System.Security.Claims;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services;

public class CurrentAdminService : ICurrentAdminService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentAdminService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public CurrentAdminContext GetCurrentAdmin()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user == null || user.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("No authenticated admin found.");
        }

        var adminRole = user.FindFirstValue("adminRole");

        if (string.IsNullOrEmpty(adminRole))
        {
            throw new UnauthorizedAccessException("Token is not an admin token.");
        }

        var adminUserId = GetGuidClaim(user, ClaimTypes.NameIdentifier);
        var bankIntegrationIdValue = user.FindFirstValue("bankIntegrationId");
        Guid? bankIntegrationId = Guid.TryParse(bankIntegrationIdValue, out var parsedBankId)
            ? parsedBankId
            : null;

        return new CurrentAdminContext
        {
            AdminUserId = adminUserId,
            BankIntegrationId = bankIntegrationId,
            AdminRole = adminRole,
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