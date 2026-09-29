using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Route("api/v1/risk-zones")]
[Authorize]
public class RiskZonesController : ControllerBase
{
    private readonly IRiskZoneService _riskZoneService;

    public RiskZonesController(IRiskZoneService riskZoneService)
    {
        _riskZoneService = riskZoneService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<RiskZoneResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RiskZoneResponseDto>>> GetActiveRiskZones()
    {
        var zones = await _riskZoneService.GetActiveAsync();
        return Ok(zones);
    }
}