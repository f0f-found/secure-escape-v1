using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface ISecureEscapeService
{
    Task<DecoyProfileResponseDto?> GetActiveDecoyProfileAsync();

    Task<DecoyProfileResponseDto> UpsertDecoyProfileAsync(UpsertDecoyProfileRequestDto request);

    Task<bool> SetDuressPinAsync(SetDuressPinRequestDto request);
}