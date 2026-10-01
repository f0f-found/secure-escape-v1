using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class TransactionPreflightRequestDto
{
    [Required]
    public Guid BankAccountId { get; set; }

    [Range(0.01, 1_000_000)]
    public decimal Amount { get; set; }
}
