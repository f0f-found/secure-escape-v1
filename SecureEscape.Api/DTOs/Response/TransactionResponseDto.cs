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
    public TransactionStatus Status { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}