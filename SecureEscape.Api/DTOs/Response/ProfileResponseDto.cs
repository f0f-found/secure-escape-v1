using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Response;

public class ProfileResponseDto
{
    public Guid Id { get; set; }

    public Guid BankIntegrationId { get; set; }

    public string BankCustomerId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public UserStatus Status { get; set; }

    public Guid UserSessionId { get; set; }

    public SessionMode SessionMode { get; set; }
}