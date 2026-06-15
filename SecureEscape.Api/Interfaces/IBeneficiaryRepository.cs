using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces
{
    public interface IBeneficiaryRepository
    {
        //Listing user's beneficiaries. 
        // Fetching beneficiary data related to a specific user
        Task<List<Beneficiary>> GetAllByUserIdAsync(Guid userId);

        Task<Beneficiary?> GetByIdForUserAsync(Guid id, Guid userId);
        Task<Beneficiary?> GetByAccountNumberAsync(Guid userId, string accountNumber);

        Task AddAsync(Beneficiary beneficiary);
        Task UpdateAsync(Beneficiary beneficiary);
    }
}