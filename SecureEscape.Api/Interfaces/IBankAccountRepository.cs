using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IBankAccountRepository
{
    Task<List<BankAccount>> GetByUserIdAsync(Guid userId);

    Task<BankAccount?> GetByIdForUserAsync(Guid accountId, Guid userId);
    Task UpdateAsync(BankAccount account);
}