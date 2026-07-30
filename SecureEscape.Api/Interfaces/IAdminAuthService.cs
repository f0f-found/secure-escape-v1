using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IAdminAuthService
{
    Task<AdminLoginResponseDto?> LoginAsync(AdminLoginRequestDto request);
}