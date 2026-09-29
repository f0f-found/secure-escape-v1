using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface ISecureEscapeEnrollmentRepository
{
    Task<SecureEscapeEnrollment?> GetByUserIdAsync(Guid userId);

    Task AddAsync(SecureEscapeEnrollment enrollment);

    Task UpdateAsync(SecureEscapeEnrollment enrollment);
}