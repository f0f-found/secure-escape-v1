using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin,SecureEscapeAdmin")]
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

    [HttpGet("{sessionId:guid}")]
    public async Task<ActionResult<DuressSessionDetailResponseDto>> GetDuressSessionById(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var session = await _adminSessionService.GetDuressSessionDetailAsync(sessionId, currentAdmin.BankIntegrationId);

        if (session == null)
            return NotFound(new { message = "Session not found." });

        return Ok(session);
    }

    [HttpPost("{sessionId:guid}/dispatch-notifications")]
    public async Task<IActionResult> DispatchSessionNotifications(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession = await _adminSessionService.DispatchSessionNotificationsAsync(
            sessionId,
            currentAdmin.BankIntegrationId);

        if (updatedSession == null)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPatch("{sessionId:guid}/case-status")]
    public async Task<IActionResult> UpdateCaseStatus(Guid sessionId, UpdateCaseStatusRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var updatedSession = await _adminSessionService.UpdateCaseStatusAsync(
            sessionId,
            request,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return NotFound(new { message = "Session not found." });

        return Ok(updatedSession);
    }

    [HttpPost("{sessionId:guid}/actions")]
    public async Task<IActionResult> AddCaseAction(Guid sessionId, CreateCaseActionRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var updatedSession = await _adminSessionService.AddCaseActionAsync(
            sessionId,
            request,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return NotFound(new { message = "Session not found." });

        return Ok(updatedSession);
    }

    [HttpPost("{sessionId:guid}/freeze-accounts")]
    public async Task<IActionResult> FreezeAccounts(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var updatedSession = await _adminSessionService.FreezeAccountAsync(
            sessionId,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return NotFound(new { message = "Session not found." });

        return Ok(updatedSession);
    }
}