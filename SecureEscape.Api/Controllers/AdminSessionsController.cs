using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
[Route("api/v1/admin/duress-sessions")]
public class AdminSessionsController : ControllerBase
{
    private readonly IAdminSessionService _adminSessionService;
    private readonly ICurrentAdminService _currentAdminService;

    public AdminSessionsController(
        IAdminSessionService adminSessionService,
        ICurrentAdminService currentAdminService)
    {
        _adminSessionService = adminSessionService;
        _currentAdminService = currentAdminService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DuressSessionSummaryResponseDto>>> GetDuressSessions()
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var sessions = await _adminSessionService.GetDuressSessionsAsync(currentAdmin.BankIntegrationId);
        return Ok(sessions);
    }
}