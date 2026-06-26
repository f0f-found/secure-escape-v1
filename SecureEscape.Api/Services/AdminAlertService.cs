using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AdminAlertService : IAdminAlertService
{
    private readonly IAlertRepository _alertRepository;

    public AdminAlertService(IAlertRepository alertRepository)
    {
        _alertRepository = alertRepository;
    }

    public async Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status, Guid? bankIntegrationId)
    {
        var alerts = await _alertRepository.GetAllAsync(status, bankIntegrationId);
        return alerts.Select(MapToSummary).ToList();
    }

    private static AlertSummaryResponseDto MapToSummary(Alert alert)
    {
        return new AlertSummaryResponseDto
        {
            Id = alert.Id,
            UserId = alert.UserId,
            UserSessionId = alert.UserSessionId,
            CustomerName = alert.User?.FullName ?? string.Empty,
            CustomerEmail = alert.User?.Email ?? string.Empty,
            Type = alert.Type,
            Severity = alert.Severity,
            Status = alert.Status,
            Description = alert.Description,
            CreatedAt = alert.CreatedAt,
            ResolvedAt = alert.ResolvedAt
        };
    }
}