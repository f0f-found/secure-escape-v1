using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

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

    [MaxLength(255)]
    public string DeviceInfo { get; set; } = string.Empty;

    [MaxLength(100)]
    public string IpAddress { get; set; } = string.Empty;

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public decimal? AccuracyMeters { get; set; }
}