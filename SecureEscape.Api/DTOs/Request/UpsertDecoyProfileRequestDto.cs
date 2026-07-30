using System.ComponentModel.DataAnnotations;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Request;

public class UpsertDecoyProfileRequestDto
{
    public DecoyProfileType ProfileType { get; set; } = DecoyProfileType.LowProfile;

    [Range(0, 1_000_000)]
    public decimal DisplayBalance { get; set; }

    [Range(0, 1_000_000)]
    public decimal EmergencyBudget { get; set; }

    [Range(0, 1_000_000)]
    public decimal Tier1Limit { get; set; }

    [Range(0, 1_000_000)]
    public decimal Tier2Limit { get; set; }

    [Range(0, 168)]
    public int Tier2DelayHours { get; set; } = 24;
}