using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class VerifyPinRequestDto
{
    [Required]
    [MinLength(4)]
    [MaxLength(6)]
    public string Pin { get; set; } = string.Empty;
}