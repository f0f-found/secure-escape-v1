using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    public TransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BankTransaction>> GetByUserIdAsync(Guid userId)
    {
        return await _context.BankTransactions
            .AsNoTracking()
            .Include(x => x.Beneficiary)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<BankTransaction>> GetDueDelayedTransactionsAsync(DateTime asOf)
    {
        return await _context.BankTransactions
            .Include(x => x.BankAccount)
            .Where(x => x.Status == TransactionStatus.Delayed
                && x.ScheduledReleaseAt != null
                && x.ScheduledReleaseAt <= asOf)
            .ToListAsync();
    }

    public async Task<decimal> GetImmediateDuressSpendForSessionAsync(Guid userSessionId)
    {
        return await _context.BankTransactions
            .Where(x => x.UserSessionId == userSessionId
                && x.Status == TransactionStatus.DecoyApproved
                && x.ScheduledReleaseAt == null)
            .SumAsync(x => (decimal?)x.Amount) ?? 0m;
    }

    public async Task<decimal> GetTier2DuressSpendForSessionAsync(Guid userSessionId)
    {
        return await _context.BankTransactions
            .Where(x => x.UserSessionId == userSessionId
                && x.ScheduledReleaseAt != null
                && x.Status != TransactionStatus.Failed
                && x.Status != TransactionStatus.Blocked)
            .SumAsync(x => (decimal?)x.Amount) ?? 0m;
    }

    public async Task AddAsync(BankTransaction transaction)
    {
        await _context.BankTransactions.AddAsync(transaction);

    }

    public Task UpdateAsync(BankTransaction transaction)
    {
        _context.BankTransactions.Update(transaction);
        return Task.CompletedTask;
    }
}
