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

    public SecureEscapeController(
        ISecureEscapeService secureEscapeService)
    {
        _secureEscapeService = secureEscapeService;
    }

    [HttpGet("decoy-profile")]
    public async Task<ActionResult<DecoyProfileResponseDto>>
        GetActiveDecoyProfile()
    {
        var decoyProfile =
            await _secureEscapeService.GetActiveDecoyProfileAsync();

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
    public async Task<ActionResult<DecoyProfileResponseDto>>
        UpsertDecoyProfile(
            [FromBody] UpsertDecoyProfileRequestDto request)
    {
        var decoyProfile =
            await _secureEscapeService.UpsertDecoyProfileAsync(request);

        return Ok(decoyProfile);
    }

    [HttpPost("duress-pin")]
    public async Task<IActionResult> SetDuressPin(
        [FromBody] SetDuressPinRequestDto request)
    {
        var updated =
            await _secureEscapeService.SetDuressPinAsync(request);

        if (!updated)
        {
            return Unauthorized(new
            {
                message = "PIN verification failed."
            });
        }

        return Ok(new
        {
            message = "Duress PIN updated successfully."
        });
    }

    [HttpGet("duress-pin/status")]
    public async Task<IActionResult> GetDuressPinStatus()
    {
        var status =
            await _secureEscapeService.GetDuressPinStatusAsync();

        return Ok(status);
    }

    [HttpGet("enrollment/status")]
    public async Task<IActionResult> GetEnrollmentStatus()
    {
        var status =
            await _secureEscapeService.GetEnrollmentStatusAsync();

        return Ok(status);
    }

    [HttpPost("enrollment/complete")]
    public async Task<IActionResult> CompleteEnrollment()
    {
        var completed =
            await _secureEscapeService.CompleteEnrollmentAsync();

        if (!completed)
        {
            return BadRequest(new
            {
                message =
                    "Secure Escape setup is incomplete. Complete all required setup steps before activation."
            });
        }

        return Ok(new
        {
            message = "Secure Escape activated successfully.",
            status = "Active"
        });
    }
}