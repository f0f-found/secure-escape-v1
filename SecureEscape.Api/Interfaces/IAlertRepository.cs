using SecureEscape.Api.Enums;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IAlertRepository
{
    Task<List<Alert>> GetAllAsync(AlertStatus? status, Guid? bankIntegrationId);

    Task<Alert?> GetByIdAsync(Guid alertId);

    Task AddAsync(Alert alert);

    Task UpdateAsync(Alert alert);
}