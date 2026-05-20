using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class AccountResponseDto
{
    public Guid Id { get; set; }

    public string AccountNumber { get; set; } = string.Empty;

    public string AccountName { get; set; } = string.Empty;

    public AccountType AccountType { get; set; }

    public decimal AvailableBalance { get; set; }

    public decimal CurrentBalance { get; set; }

    public string Currency { get; set; } = "ZAR";

    public AccountStatus Status { get; set; }

    public bool IsDecoyView { get; set; }
}