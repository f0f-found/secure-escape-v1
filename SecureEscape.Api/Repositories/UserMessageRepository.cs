using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories
{
    public class UserMessageRepository : IUserMessageRepository
    {
        private readonly AppDbContext _context;

        public UserMessageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserMessage>> GetAllByUserIdAsync(Guid userId)
        {
            return await _context.UserMessages
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<UserMessage?> GetByIdForUserAsync(
            Guid id,
            Guid userId)
        {
            return await _context.UserMessages
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);
        }

        public async Task<UserMessage?> GetByDeduplicationKeyAsync(
            Guid userId,
            string deduplicationKey)
        {
            return await _context.UserMessages
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.DeduplicationKey == deduplicationKey);
        }

        public async Task AddAsync(UserMessage message)
        {
            await _context.UserMessages.AddAsync(message);
        }

        public Task UpdateAsync(UserMessage message)
        {
            _context.UserMessages.Update(message);
            return Task.CompletedTask;
        }
    }
}