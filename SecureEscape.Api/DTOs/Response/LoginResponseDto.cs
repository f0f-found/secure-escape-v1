namespace SecureEscape.Api.DTOs.Response;

public class LoginResponseDto
{
    public Guid UserId { get; set; }

    public Guid UserSessionId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public string SessionMode { get; set; } = string.Empty;

    public bool IsDuress { get; set; }
}