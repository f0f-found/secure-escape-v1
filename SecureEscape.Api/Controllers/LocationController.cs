using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Route("api/v1/locations")]
[Authorize]
public class LocationController : ControllerBase
{
    private readonly ILocationService _locationService;

    public LocationController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLocationEvent(
        [FromBody] CreateLocationEventRequestDto request)
    {
        var locationSaved = await _locationService
            .RecordCurrentUserLocationAsync(request);

        if (!locationSaved)
        {
            return Unauthorized(new
            {
                message = "A valid active session is required to record location."
            });
        }

        return Ok(new
        {
            message = "Location recorded successfully."
        });
    }

    [HttpGet("sessions/{userSessionId:guid}")]
    [Authorize(Roles = "FraudManager,FraudAnalyst,SystemAdmin,SecureEscapeAdmin")]
    public async Task<ActionResult<List<LocationEventResponseDto>>> GetSessionLocationHistory(
        Guid userSessionId)
    {
        var locations = await _locationService
            .GetSessionLocationHistoryAsync(userSessionId);

        return Ok(locations);
    }
}