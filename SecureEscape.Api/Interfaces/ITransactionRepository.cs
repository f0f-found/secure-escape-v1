using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface ITransactionRepository
{
    Task<List<BankTransaction>> GetByUserIdAsync(Guid userId);
    Task<List<BankTransaction>> GetDueDelayedTransactionsAsync(DateTime asOf);
    Task<decimal> GetImmediateDuressSpendForSessionAsync(Guid userSessionId);
    Task<decimal> GetTier2DuressSpendForSessionAsync(Guid userSessionId);
    Task AddAsync(BankTransaction transaction);
    Task UpdateAsync(BankTransaction transaction);
}
