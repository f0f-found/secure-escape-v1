using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class AssignSessionRequestDto
{
    [Required]
    public Guid AdminUserId { get; set; }

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;
}