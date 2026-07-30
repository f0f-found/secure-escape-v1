using System.ComponentModel.DataAnnotations;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Request;

public class CreateLocationEventRequestDto
{
    [Range(-90, 90)]
    public decimal Latitude { get; set; }

    [Range(-180, 180)]
    public decimal Longitude { get; set; }

    [Range(0, 10000)]
    public decimal AccuracyMeters { get; set; }

    public LocationSource LocationSource { get; set; } = LocationSource.Gps;
}