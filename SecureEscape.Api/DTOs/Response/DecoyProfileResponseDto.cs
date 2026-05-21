using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class DecoyProfileResponseDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public DecoyProfileType ProfileType { get; set; }

    public decimal DisplayBalance { get; set; }

    public decimal EmergencyBudget { get; set; }

    public decimal Tier1Limit { get; set; }

    public decimal Tier2Limit { get; set; }

    public int Tier2DelayHours { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}