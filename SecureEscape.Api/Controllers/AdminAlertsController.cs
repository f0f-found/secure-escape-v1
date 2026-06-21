using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
[Route("api/v1/admin/alerts")]
public class AdminAlertsController : ControllerBase
{
    private readonly IAdminAlertService _adminAlertService;
    private readonly ICurrentAdminService _currentAdminService;

    public AdminAlertsController(
    IAdminAlertService adminAlertService,
    ICurrentAdminService currentAdminService)
    {
        _adminAlertService = adminAlertService;
        _currentAdminService = currentAdminService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AlertSummaryResponseDto>>> GetAlerts(
        [FromQuery] AlertStatus? status = null)
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var alerts = await _adminAlertService.GetAlertsAsync(status, currentAdmin.BankIntegrationId);
        return Ok(alerts);
    }
    
    [HttpGet("{alertId:guid}")]
    public async Task<ActionResult<AlertDetailResponseDto>> GetAlertById(Guid alertId)
    {
        var alert = await _adminAlertService.GetAlertByIdAsync(alertId);

        if (alert == null)
        {
            return NotFound(new
            {
                message = "Alert not found."
            });
        }

        return Ok(alert);
    }

    [HttpPatch("{alertId:guid}/status")]
    public async Task<IActionResult> UpdateAlertStatus(
        Guid alertId,
        UpdateAlertStatusRequestDto request)
    {
        var updated = await _adminAlertService.UpdateAlertStatusAsync(alertId, request);

        if (!updated)
        {
            return NotFound(new
            {
                message = "Alert not found."
            });
        }

        return Ok(new
        {
            message = "Alert status updated successfully."
        });
    }

    [HttpPost("{alertId:guid}/actions")]
    public async Task<IActionResult> AddAlertAction(
        Guid alertId,
        CreateAlertActionRequestDto request)
    {
        var created = await _adminAlertService.AddAlertActionAsync(alertId, request);

        if (!created)
        {
            return NotFound(new
            {
                message = "Alert not found."
            });
        }

        return Ok(new
        {
            message = "Alert action added successfully."
        });
    }
}