using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdWithCredentialsAsync(Guid userId);

    Task UpdateAsync(User user);
}