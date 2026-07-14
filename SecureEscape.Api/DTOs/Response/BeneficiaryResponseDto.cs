using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class BeneficiaryResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public BeneficiaryStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}