using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class CreateTransactionRequestDto
{
    [Required]
    public Guid BankAccountId { get; set; }

    [Required]
    public Guid BeneficiaryId { get; set; }

    [Required]
    [Range(0.01, 1_000_000)]
    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}