using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories
{
    public class BeneficiaryRepository : IBeneficiaryRepository
    {
        private readonly AppDbContext _context;

        public BeneficiaryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Beneficiary beneficiary)
        {
            await _context.Beneficiaries.AddAsync(beneficiary);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Beneficiary>> GetAllByUserIdAsync(Guid userId)
        {
            return await _context.Beneficiaries
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.Status == BeneficiaryStatus.Active)
            .OrderBy(x => x.Name)
            .ToListAsync();
        }

        public async Task<Beneficiary?> GetByIdForUserAsync(Guid id, Guid userId)
        {
            return await _context.Beneficiaries
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        }

        public async Task<Beneficiary?> GetByAccountNumberAsync(Guid userId, string accountNumber)
        {
            return await _context.Beneficiaries
                .FirstOrDefaultAsync(x => x.UserId == userId
                    && x.AccountNumber == accountNumber
                    && x.Status == BeneficiaryStatus.Active);
        }

        public async Task UpdateAsync(Beneficiary beneficiary)
        {
            _context.Beneficiaries.Update(beneficiary);
            await _context.SaveChangesAsync();
        }
    }
}