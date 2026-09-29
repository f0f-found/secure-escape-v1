using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class SetDuressPinRequestDto
{
    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "Current PIN must be exactly 4 digits.")]
    public string CurrentPin { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "Duress PIN must be exactly 4 digits.")]
    public string DuressPin { get; set; } = string.Empty;
}