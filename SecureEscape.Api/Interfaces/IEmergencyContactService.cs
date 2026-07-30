using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IEmergencyContactService
{
    Task<List<EmergencyContactResponseDto>> GetAllAsync();
    Task<EmergencyContactResponseDto> AddAsync(AddEmergencyContactRequestDto request);
    Task DeleteAsync(Guid id);
}