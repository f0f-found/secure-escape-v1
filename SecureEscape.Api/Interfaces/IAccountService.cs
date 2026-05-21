using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponseDto>> GetCurrentUserAccountsAsync();

    Task<AccountResponseDto?> GetCurrentUserAccountByIdAsync(Guid accountId);
}