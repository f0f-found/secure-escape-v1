using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class RiskZoneService : IRiskZoneService
{
    private readonly IRiskZoneRepository _repository;

    public RiskZoneService(IRiskZoneRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<RiskZoneResponseDto>> GetActiveAsync()
    {
        var zones = await _repository.GetActiveAsync();

        return zones
            .Select(MapToResponse)
            .ToList();
    }

    private static RiskZoneResponseDto MapToResponse(RiskZone zone) => new()
    {
        Id = zone.Id,
        Name = zone.Name,
        RiskLevel = zone.RiskLevel,
        Latitude = zone.Latitude,
        Longitude = zone.Longitude,
        RadiusMeters = zone.RadiusMeters,
        RiskScore = zone.RiskScore,
        IncidentCount = zone.IncidentCount,
        DuressEventCount = zone.DuressEventCount,
        Description = zone.Description
    };
}