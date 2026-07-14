using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IBeneficiaryService
{
    Task<List<BeneficiaryResponseDto>> GetAllAsync();
    Task<BeneficiaryResponseDto> AddAsync(AddBeneficiaryRequestDto request);
    Task<bool> DeactivateAsync(Guid id);
}