using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class DuressSessionDetailResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhoneNumber { get; set; } = string.Empty;

    public SessionMode Mode { get; set; }
    public SessionStatus Status { get; set; }
    public CaseStatus CaseStatus { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string DeviceInfo { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime? CaseResolvedAt { get; set; }

    public int AlertCount { get; set; }

    public int TransactionCount { get; set; }

    public int LocationCount { get; set; }

    public int NotificationAttemptCount { get; set; }

    public RiskLevel HighestSeverity { get; set; } = RiskLevel.Low;

    public DateTime? LastLocationAt { get; set; }

    public DateTime? LastAlertAt { get; set; }

    public bool AccountsFrozen { get; set; }

    public List<SessionAlertLogResponseDto> Alerts { get; set; } = new();
    public List<AlertTransactionResponseDto> Transactions { get; set; } = new();
    public List<AlertLocationResponseDto> Locations { get; set; } = new();
    public List<AlertActionResponseDto> Actions { get; set; } = new();
}