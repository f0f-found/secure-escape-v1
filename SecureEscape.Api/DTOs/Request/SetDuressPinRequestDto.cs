using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class SetDuressPinRequestDto
{
    [Required]
    public string CurrentPin { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    [MaxLength(6)]
    public string DuressPin { get; set; } = string.Empty;
}