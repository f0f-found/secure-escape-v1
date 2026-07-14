using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class TransactionResponseDto
{
    public Guid Id { get; set; }
    public Guid BankAccountId { get; set; }
    public Guid? BeneficiaryId { get; set; }
    public string? BeneficiaryName { get; set; }
    public string BankReference { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "ZAR";
    public string? VoucherNumber { get; set; }  
    public DateTime? VoucherExpiresAt { get; set; }
    public bool VoucherRedeemed { get; set; }
    public TransactionStatus Status { get; set; }
    public string? StatusReason { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? SecureEscapeCode { get; set; }
    public DateTime CreatedAt { get; set; }
}