using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Interfaces;

public interface IAdminAlertService
{
    Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status, Guid? bankIntegrationId);

    Task<AlertDetailResponseDto?> GetAlertDetailAsync(Guid alertId, Guid? bankIntegrationId);

    Task<bool> UpdateAlertStatusAsync(
        Guid alertId,
        UpdateAlertStatusRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId);
}