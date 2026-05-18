using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs;

public class CurrentUserContext
{
    public Guid UserId { get; set; }

    public Guid BankIntegrationId { get; set; }

    public Guid UserSessionId { get; set; }

    public SessionMode SessionMode { get; set; }

    public string Email { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;
}