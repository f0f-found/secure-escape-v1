using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IAdminUserService
{
    Task<List<AdminUserSummaryResponseDto>> GetAnalystsAsync(Guid? bankIntegrationId);
}