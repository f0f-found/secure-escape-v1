using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;
/*
    This gives the controller one clean method 
    to call when the mobile app sends a new GPS update.
*/
public interface ILocationService
{
    Task<bool> RecordCurrentUserLocationAsync(CreateLocationEventRequestDto request);
    Task<List<LocationEventResponseDto>> GetSessionLocationHistoryAsync(Guid userSessionId);
}