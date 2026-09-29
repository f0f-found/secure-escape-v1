using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IRiskZoneService
{
    Task<List<RiskZoneResponseDto>> GetActiveAsync();
}