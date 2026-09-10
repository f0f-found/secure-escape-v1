using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class DuressSessionSummaryResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;

    public SessionStatus Status { get; set; }
    public CaseStatus CaseStatus { get; set; }

    public DateTime? LastAlertAt { get; set; }

    // Latest GPS information used by the dashboard incident map.
    public DateTime? LastLocationAt { get; set; }
    public decimal? LatestLatitude { get; set; }
    public decimal? LatestLongitude { get; set; }
    public decimal? LatestAccuracyMeters { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public int AlertCount { get; set; }

    public RiskLevel HighestSeverity { get; set; }

    public List<string> AlertTypes { get; set; } = new();

    public Guid? AssignedAdminUserId { get; set; }
    public string? AssignedAdminName { get; set; }
    public DateTime? AssignedAt { get; set; }

    public ManagerReviewStatus ManagerReviewStatus { get; set; }

    public DateTime? ResolutionSubmittedAt { get; set; }
    public DateTime? ManagerReviewedAt { get; set; }
}