using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class NotificationAttemptResponseDto
{
    public Guid Id { get; set; }

    public NotificationChannel Channel { get; set; }

    public string Destination { get; set; } = string.Empty;

    public NotificationStatus Status { get; set; }

    public string ErrorMessage { get; set; } = string.Empty;

    public DateTime AttemptedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}