using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
[Route("api/v1/admin/duress-sessions")]
public class AdminSessionsController : ControllerBase
{
    private readonly IAdminSessionService _adminSessionService;
    private readonly ICurrentAdminService _currentAdminService;
    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;

    public AdminSessionsController(
        IAdminSessionService adminSessionService,
        ICurrentAdminService currentAdminService,
        AppDbContext dbContext,
        IWebHostEnvironment environment)
    {
        _adminSessionService = adminSessionService;
        _currentAdminService = currentAdminService;
        _dbContext = dbContext;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<List<DuressSessionSummaryResponseDto>>> GetDuressSessions()
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var sessions = await _adminSessionService.GetDuressSessionsAsync(
            currentAdmin.BankIntegrationId);

        return Ok(sessions);
    }

    [HttpGet("{sessionId:guid}")]
    public async Task<ActionResult<DuressSessionDetailResponseDto>> GetDuressSessionById(
        Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var session = await _adminSessionService.GetDuressSessionDetailAsync(
            sessionId,
            currentAdmin.BankIntegrationId);

        if (session == null)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        return Ok(session);
    }

    [HttpGet("{sessionId:guid}/evidence")]
    public async Task<IActionResult> GetSessionEvidence(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var sessionExists = await _dbContext.UserSessions
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == sessionId &&
                x.User != null &&
                x.User.BankIntegrationId == currentAdmin.BankIntegrationId &&
                x.Mode == SessionMode.Duress);

        if (!sessionExists)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        var evidence = await _dbContext.SessionEvidence
            .AsNoTracking()
            .Where(x => x.UserSessionId == sessionId)
            .OrderByDescending(x => x.CapturedAt)
            .Select(x => new
            {
                id = x.Id,
                userSessionId = x.UserSessionId,
                bankTransactionId = x.BankTransactionId,
                evidenceType = x.EvidenceType,
                fileName = x.FileName,
                contentType = x.ContentType,
                fileSizeBytes = x.FileSizeBytes,
                capturedAt = x.CapturedAt,
                createdAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(evidence);
    }

    [HttpGet("{sessionId:guid}/evidence/{evidenceId:guid}/file")]
    public async Task<IActionResult> GetSessionEvidenceFile(
        Guid sessionId,
        Guid evidenceId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var sessionExists = await _dbContext.UserSessions
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == sessionId &&
                x.User != null &&
                x.User.BankIntegrationId == currentAdmin.BankIntegrationId &&
                x.Mode == SessionMode.Duress);

        if (!sessionExists)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        var evidence = await _dbContext.SessionEvidence
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == evidenceId &&
                x.UserSessionId == sessionId);

        if (evidence == null)
        {
            return NotFound(new
            {
                message = "Evidence not found."
            });
        }

        var evidenceRoot = Path.GetFullPath(
            Path.Combine(
                _environment.ContentRootPath,
                "App_Data",
                "SessionEvidence"));

        var fullPath = Path.GetFullPath(
            Path.Combine(
                _environment.ContentRootPath,
                evidence.StoragePath));

        var evidenceRootWithSeparator =
            evidenceRoot.TrimEnd(
                Path.DirectorySeparatorChar,
                Path.AltDirectorySeparatorChar) +
            Path.DirectorySeparatorChar;

        if (!fullPath.StartsWith(
                evidenceRootWithSeparator,
                StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(new
            {
                message = "Evidence file not found."
            });
        }

        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound(new
            {
                message = "Evidence file not found."
            });
        }

        var fileStream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read);

        return File(
            fileStream,
            evidence.ContentType,
            enableRangeProcessing: true);
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
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

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
        {
            return BadRequest(new
            {
                message = "Session cannot be claimed. It may already be assigned or unavailable."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPost("{sessionId:guid}/dispatch-notifications")]
    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
    public async Task<IActionResult> DispatchSessionNotifications(
        Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.DispatchSessionNotificationsAsync(
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
    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
    public async Task<IActionResult> UpdateCaseStatus(
        Guid sessionId,
        UpdateCaseStatusRequestDto request)
    {
        // Final case outcomes must not bypass the formal review workflow.
        if (request.CaseStatus == CaseStatus.Resolved ||
            request.CaseStatus == CaseStatus.FalseAlarm)
        {
            return BadRequest(new
            {
                message =
                    "Final case closure cannot be performed through the case-status endpoint. Submit the investigation report for manager review."
            });
        }

        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.UpdateCaseStatusAsync(
                sessionId,
                request,
                currentAdmin.BankIntegrationId,
                currentAdmin.AdminUserId);

        if (updatedSession == null)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPatch("{sessionId:guid}/case-report")]
    [Authorize(Roles = "FraudAnalyst,SystemAdmin")]
    public async Task<IActionResult> SubmitCaseReport(
        Guid sessionId,
        SubmitCaseReportRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.SubmitCaseReportAsync(
                sessionId,
                request,
                currentAdmin.BankIntegrationId,
                currentAdmin.AdminUserId);

        if (updatedSession == null)
        {
            return NotFound(new
            {
                message = "Session not found or not assigned to this analyst."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPatch("{sessionId:guid}/manager-review")]
    [Authorize(Roles = "FraudManager,SystemAdmin")]
    public async Task<IActionResult> ManagerReviewCase(
        Guid sessionId,
        ManagerReviewCaseRequestDto request)
    {
        if (request.ReviewStatus == ManagerReviewStatus.Rejected &&
            string.IsNullOrWhiteSpace(request.ReviewNotes))
        {
            return BadRequest(new
            {
                message =
                    "A reason is required when returning a report for changes."
            });
        }

        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.ManagerReviewCaseAsync(
                sessionId,
                request,
                currentAdmin.BankIntegrationId,
                currentAdmin.AdminUserId);

        if (updatedSession == null)
        {
            return BadRequest(new
            {
                message =
                    "Case cannot be reviewed. It may not be pending manager review."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPost("{sessionId:guid}/actions")]
    [Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
    public async Task<IActionResult> AddCaseAction(
        Guid sessionId,
        CreateCaseActionRequestDto request)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.AddCaseActionAsync(
                sessionId,
                request,
                currentAdmin.BankIntegrationId,
                currentAdmin.AdminUserId);

        if (updatedSession == null)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        return Ok(updatedSession);
    }

    [HttpPost("{sessionId:guid}/freeze-accounts")]
    [Authorize(Roles = "FraudManager,SystemAdmin")]
    public async Task<IActionResult> FreezeAccounts(Guid sessionId)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();

        var updatedSession =
            await _adminSessionService.FreezeAccountAsync(
                sessionId,
                currentAdmin.BankIntegrationId,
                currentAdmin.AdminUserId);

        if (updatedSession == null)
        {
            return NotFound(new
            {
                message = "Session not found."
            });
        }

        return Ok(updatedSession);
    }
}