using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class AlertDetailResponseDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid UserSessionId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public string CustomerPhoneNumber { get; set; } = string.Empty;

    public AlertType Type { get; set; }

    public RiskLevel Severity { get; set; }

    public AlertStatus Status { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public string SessionMode { get; set; } = string.Empty;

    public string SessionStatus { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public string DeviceInfo { get; set; } = string.Empty;

    public DateTime SessionStartedAt { get; set; }

    public List<AlertLocationResponseDto> Locations { get; set; } = new();

    public List<AlertTransactionResponseDto> Transactions { get; set; } = new();

    public List<AlertActionResponseDto> Actions { get; set; } = new();

    public List<NotificationAttemptResponseDto> NotificationAttempts { get; set; } = new();
}