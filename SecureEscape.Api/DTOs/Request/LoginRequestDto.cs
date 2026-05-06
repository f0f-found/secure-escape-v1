using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    [MaxLength(6)]
    public string Pin { get; set; } = string.Empty;
}
