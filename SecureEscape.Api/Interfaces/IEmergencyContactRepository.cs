using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IEmergencyContactRepository
{
    Task<List<EmergencyContact>> GetAllByUserIdAsync(Guid userId);
    Task<EmergencyContact?> GetByIdForUserAsync(Guid id, Guid userId);
    Task AddAsync(EmergencyContact contact);
    Task UpdateAsync(EmergencyContact contact);
    Task DeleteAsync(EmergencyContact contact);
}