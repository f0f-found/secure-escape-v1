using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Interfaces;

public interface IAdminAlertService
{
    Task<List<AlertSummaryResponseDto>> GetAlertsAsync(AlertStatus? status = null);

    Task<AlertDetailResponseDto?> GetAlertByIdAsync(Guid alertId);

    Task<bool> UpdateAlertStatusAsync(Guid alertId, UpdateAlertStatusRequestDto request);

    Task<bool> AddAlertActionAsync(Guid alertId, CreateAlertActionRequestDto request);
}