using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface ITransactionRepository
{
    Task<List<BankTransaction>> GetByUserIdAsync(Guid userId);
    Task AddAsync(BankTransaction transaction);
}