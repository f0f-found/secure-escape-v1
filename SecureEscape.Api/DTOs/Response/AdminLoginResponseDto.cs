namespace SecureEscape.Api.DTOs.Response;

public class AdminLoginResponseDto
{
    public Guid AdminUserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AdminRole { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}