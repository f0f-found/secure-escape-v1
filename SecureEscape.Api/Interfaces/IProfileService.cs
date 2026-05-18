using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IProfileService
{
    Task<ProfileResponseDto> GetCurrentProfileAsync();
}