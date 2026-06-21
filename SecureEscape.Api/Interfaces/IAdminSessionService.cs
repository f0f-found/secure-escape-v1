using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IAdminSessionService
{
    Task<List<DuressSessionSummaryResponseDto>> GetDuressSessionsAsync(Guid? bankIntegrationId);
}