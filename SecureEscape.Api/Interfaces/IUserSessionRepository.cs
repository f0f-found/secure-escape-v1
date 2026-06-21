using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IUserSessionRepository
{
    Task<List<UserSession>> GetDuressSessionsAsync(Guid? bankIntegrationId);
    Task<UserSession?> GetDuressSessionDetailAsync(Guid sessionId);
}