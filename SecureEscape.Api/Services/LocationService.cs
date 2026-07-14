using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Services;
/*
    -   It records a new location against the current user session. 
    -   If there is an open alert for that session, it also links 
        the location to the alert.
*/
public class LocationService : ILocationService
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly ILocationEventRepository _locationEventRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LocationService(
        ICurrentUserService currentUserService,
        IUserSessionRepository userSessionRepository,
        ILocationEventRepository locationEventRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _userSessionRepository = userSessionRepository;
        _locationEventRepository = locationEventRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> RecordCurrentUserLocationAsync(CreateLocationEventRequestDto request)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var session = await _userSessionRepository.GetByIdAsync(currentUser.UserSessionId);

        if (session == null)
        {
            return false;
        }

        var openAlertId = await _locationEventRepository
            .GetOpenAlertIdForSessionAsync(session.Id);

        var locationEvent = new LocationEvent
        {
            Id = Guid.NewGuid(),
            UserSessionId = session.Id,
            AlertId = openAlertId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AccuracyMeters = request.AccuracyMeters,
            LocationSource = request.LocationSource,
            CapturedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _locationEventRepository.AddAsync(locationEvent);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<List<LocationEventResponseDto>> GetSessionLocationHistoryAsync(Guid userSessionId)
    {
        var locations = await _locationEventRepository
            .GetBySessionIdAsync(userSessionId);

            

        return locations.Select(location => new LocationEventResponseDto
        {
            Id = location.Id,
            UserSessionId = location.UserSessionId,
            AlertId = location.AlertId,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            AccuracyMeters = location.AccuracyMeters,
            LocationSource = location.LocationSource.ToString(),
            CapturedAt = location.CapturedAt,
            CreatedAt = location.CreatedAt
        }).ToList();
    }
}