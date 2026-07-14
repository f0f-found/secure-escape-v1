using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
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

    public async Task AddAsync(BankTransaction transaction)
    {
        await _context.BankTransactions.AddAsync(transaction);

    }
}