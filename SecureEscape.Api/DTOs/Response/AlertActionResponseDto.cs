using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class AlertActionResponseDto
{
    public Guid Id { get; set; }

    public Guid? AdminUserId { get; set; }

    public string AdminName { get; set; } = string.Empty;

    public AlertActionType ActionType { get; set; }

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}