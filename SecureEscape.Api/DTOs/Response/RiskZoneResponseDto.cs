using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class RiskZoneResponseDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public RiskLevel RiskLevel { get; set; }

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public int RadiusMeters { get; set; }

    public decimal RiskScore { get; set; }

    public int IncidentCount { get; set; }

    public int DuressEventCount { get; set; }

    public string? Description { get; set; }
}