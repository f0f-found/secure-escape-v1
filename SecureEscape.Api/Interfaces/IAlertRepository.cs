using SecureEscape.Api.Enums;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IAlertRepository
{
    Task<List<Alert>> GetAllAsync(AlertStatus? status = null);

    Task<Alert?> GetDetailByIdAsync(Guid alertId);

    Task<Alert?> GetByIdAsync(Guid alertId);

    Task AddActionAsync(AlertAction alertAction);

    Task UpdateAsync(Alert alert);

    Task AddAsync(Alert alert);
}