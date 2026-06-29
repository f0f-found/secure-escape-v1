using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class CreateCashSendRequestDto
{
    [Required]
    public Guid BankAccountId { get; set; }

    [Required]
    [Range(0.01, 50_000)]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(6, MinimumLength = 4)]
    public string VoucherPin { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}