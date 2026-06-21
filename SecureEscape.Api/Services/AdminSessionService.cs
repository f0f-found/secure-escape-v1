using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AdminSessionService : IAdminSessionService
{
    private readonly IUserSessionRepository _userSessionRepository;

    public AdminSessionService(IUserSessionRepository userSessionRepository)
    {
        _userSessionRepository = userSessionRepository;
    }

    public async Task<List<DuressSessionSummaryResponseDto>> GetDuressSessionsAsync(Guid? bankIntegrationId)
    {
        var sessions = await _userSessionRepository.GetDuressSessionsAsync(bankIntegrationId);
        return sessions.Select(MapToSummary).ToList();
    }

    private static DuressSessionSummaryResponseDto MapToSummary(UserSession session)
    {
        var highestSeverity = session.Alerts.Any()
            ? session.Alerts.Max(a => a.Severity)
            : Enums.RiskLevel.Low;

        return new DuressSessionSummaryResponseDto
        {
            Id = session.Id,
            UserId = session.UserId,
            CustomerName = session.User?.FullName ?? string.Empty,
            CustomerEmail = session.User?.Email ?? string.Empty,
            Status = session.Status,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            AlertCount = session.Alerts.Count,
            HighestSeverity = highestSeverity,
            AlertTypes = session.Alerts.Select(a => a.Type.ToString()).Distinct().ToList()
        };
    }
}