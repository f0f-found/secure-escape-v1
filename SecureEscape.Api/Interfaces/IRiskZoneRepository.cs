using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IRiskZoneRepository
{
    Task<List<RiskZone>> GetActiveAsync();
}