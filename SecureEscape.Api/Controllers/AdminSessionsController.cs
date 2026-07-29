using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
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

    [HttpGet("{sessionId:guid}")]
    public async Task<ActionResult<DuressSessionDetailResponseDto>> GetDuressSessionById(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var session = await _adminSessionService.GetDuressSessionDetailAsync(sessionId, currentAdmin.BankIntegrationId);

        if (session == null)
            return NotFound(new { message = "Session not found." });

        return Ok(session);
    }

    [HttpPatch("{sessionId:guid}/assign")]
    [Authorize(Roles = "FraudManager,SystemAdmin")]
    public async Task<IActionResult> AssignSession(
    Guid sessionId,
    AssignSessionRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession = await _adminSessionService.AssignSessionAsync(
            sessionId,
            request,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return NotFound(new { message = "Session not found." });

        return Ok(updatedSession);
    }

    [HttpPatch("{sessionId:guid}/claim")]
    [Authorize(Roles = "FraudAnalyst,SystemAdmin")]
    public async Task<IActionResult> ClaimSession(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession = await _adminSessionService.ClaimSessionAsync(
            sessionId,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return BadRequest(new { message = "Session cannot be claimed. It may already be assigned or unavailable." });

        return Ok(updatedSession);
    }

    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
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

    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
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

    [HttpPatch("{sessionId:guid}/case-report")]
    [Authorize(Roles = "FraudAnalyst,SystemAdmin")]
    public async Task<IActionResult> SubmitCaseReport(
    Guid sessionId,
    SubmitCaseReportRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession = await _adminSessionService.SubmitCaseReportAsync(
            sessionId,
            request,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return NotFound(new { message = "Session not found or not assigned to this analyst." });

        return Ok(updatedSession);
    }

    [HttpPatch("{sessionId:guid}/manager-review")]
    [Authorize(Roles = "FraudManager,SystemAdmin")]
    public async Task<IActionResult> ManagerReviewCase(
        Guid sessionId,
        ManagerReviewCaseRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession = await _adminSessionService.ManagerReviewCaseAsync(
            sessionId,
            request,
            currentAdmin.BankIntegrationId,
            currentAdmin.AdminUserId);

        if (updatedSession == null)
            return BadRequest(new { message = "Case cannot be reviewed. It may not be pending manager review." });

        return Ok(updatedSession);
    }

    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
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

    [Authorize(Roles = "FraudManager,SystemAdmin")]
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