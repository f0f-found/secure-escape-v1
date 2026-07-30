using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class AlertSummaryResponseDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid UserSessionId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public AlertType Type { get; set; }

    public RiskLevel Severity { get; set; }

    public AlertStatus Status { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }
}