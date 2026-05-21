using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class AdminLoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}