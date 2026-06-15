using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class BankAccountRepository : IBankAccountRepository
{
    private readonly AppDbContext _context;

    public BankAccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BankAccount>> GetByUserIdAsync(Guid userId)
    {
        return await _context.BankAccounts
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.AccountName)
            .ToListAsync();
    }

    public async Task<BankAccount?> GetByIdForUserAsync(Guid accountId, Guid userId)
    {
        return await _context.BankAccounts
            //.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == accountId && x.UserId == userId);
    }

    public Task UpdateAsync(BankAccount account)
    {
        _context.BankAccounts.Update(account);
        return Task.CompletedTask;

    }
}