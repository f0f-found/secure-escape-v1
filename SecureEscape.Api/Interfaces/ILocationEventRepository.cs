using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;
/*
    -   AddAsync will save a new location point to the database.

    -   GetOpenAlertIdForSessionAsync will let us connect the location 
        update to the active duress alert, so the fraud dashboard can 
        understand that this GPS point belongs to the live emergency case.
*/
public interface ILocationEventRepository
{
    Task AddAsync(LocationEvent locationEvent);
    Task<Guid?> GetOpenAlertIdForSessionAsync(Guid userSessionId);
    Task<List<LocationEvent>> GetBySessionIdAsync(Guid userSessionId);
    Task<LocationEvent?> GetLatestBySessionIdAsync(Guid userSessionId);
}