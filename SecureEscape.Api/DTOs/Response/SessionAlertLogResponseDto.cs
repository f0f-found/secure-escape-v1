using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class SessionAlertLogResponseDto
{
    public Guid Id { get; set; }
    public AlertType Type { get; set; }
    public RiskLevel Severity { get; set; }
    public string Description { get; set; } = string.Empty;
    public AlertStatus Status { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<NotificationAttemptResponseDto> NotificationAttempts { get; set; } = new();
}