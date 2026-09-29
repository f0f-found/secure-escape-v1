using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class CreateTransactionRequestDto
{
    [Required]
    public Guid BankAccountId { get; set; }

    // Used when paying an existing saved beneficiary.
    // Null for a once-off bank transfer.
    public Guid? BeneficiaryId { get; set; }

    // Used for once-off bank transfers.
    [MaxLength(150)]
    public string? RecipientName { get; set; }

    [MaxLength(100)]
    public string? RecipientBank { get; set; }

    [MaxLength(50)]
    public string? RecipientAccountNumber { get; set; }

    [MaxLength(50)]
    public string? RecipientAccountType { get; set; }

    [MaxLength(20)]
    public string? RecipientBranchCode { get; set; }

    [Required]
    [Range(0.01, 1_000_000)]
    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}