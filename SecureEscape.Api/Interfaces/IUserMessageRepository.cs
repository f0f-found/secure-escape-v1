using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces
{
    public interface IUserMessageRepository
    {
        Task<List<UserMessage>> GetAllByUserIdAsync(Guid userId);

        Task<UserMessage?> GetByIdForUserAsync(Guid id, Guid userId);

        Task<UserMessage?> GetByDeduplicationKeyAsync(
            Guid userId,
            string deduplicationKey);

        Task AddAsync(UserMessage message);

        Task UpdateAsync(UserMessage message);
    }
}