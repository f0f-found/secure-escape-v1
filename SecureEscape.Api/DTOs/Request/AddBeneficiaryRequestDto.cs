using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class AddBeneficiaryRequestDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string BankName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string AccountNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Reference { get; set; } = string.Empty;
}