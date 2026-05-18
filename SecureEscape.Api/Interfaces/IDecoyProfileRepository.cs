using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IDecoyProfileRepository
{
    Task<DecoyProfile?> GetActiveByUserIdAsync(Guid userId);

    Task<DecoyProfile?> GetByIdForUserAsync(Guid decoyProfileId, Guid userId);

    Task AddAsync(DecoyProfile decoyProfile);

    Task UpdateAsync(DecoyProfile decoyProfile);
}