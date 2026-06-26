using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Interfaces;

public interface IAdminAlertService
{
    Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status, Guid? bankIntegrationId);
}