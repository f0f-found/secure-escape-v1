using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/secure-escape")]
public class SecureEscapeController : ControllerBase
{
    private readonly ISecureEscapeService _secureEscapeService;

    public SecureEscapeController(ISecureEscapeService secureEscapeService)
    {
        _secureEscapeService = secureEscapeService;
    }

    [HttpGet("decoy-profile")]
    public async Task<ActionResult<DecoyProfileResponseDto>> GetActiveDecoyProfile()
    {
        var decoyProfile = await _secureEscapeService.GetActiveDecoyProfileAsync();

        if (decoyProfile == null)
        {
            return NotFound(new
            {
                message = "No active decoy profile found."
            });
        }

        return Ok(decoyProfile);
    }

    [HttpPut("decoy-profile")]
    public async Task<ActionResult<DecoyProfileResponseDto>> UpsertDecoyProfile(
    [FromBody] UpsertDecoyProfileRequestDto request)
    {
        var decoyProfile = await _secureEscapeService.UpsertDecoyProfileAsync(request);

        return Ok(decoyProfile);
    }

    [HttpPost("duress-pin")]
    public async Task<IActionResult> SetDuressPin([FromBody] SetDuressPinRequestDto request)
    {
        var updated = await _secureEscapeService.SetDuressPinAsync(request);

        if (!updated)
        {
            return Unauthorized(new
            {
                message = "Password verification failed."
            });
        }

        return Ok(new
        {
            message = "Duress PIN updated successfully."
        });
    }
}