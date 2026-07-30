using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Route("api/v1/admin/notifications")]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin,SecureEscapeAdmin")]
public class AdminNotificationsController : ControllerBase
{
    private readonly INotificationDispatchService _notificationDispatchService;

    public AdminNotificationsController(
        INotificationDispatchService notificationDispatchService)
    {
        _notificationDispatchService = notificationDispatchService;
    }

    [HttpPost("{notificationAttemptId:guid}/dispatch")]
    public async Task<ActionResult<NotificationAttemptResponseDto>> Dispatch(
        Guid notificationAttemptId)
    {
        var result = await _notificationDispatchService
            .DispatchAsync(notificationAttemptId);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Notification attempt not found."
            });
        }

        return Ok(result);
    }

    [HttpPost("dispatch-pending")]
    public async Task<ActionResult<List<NotificationAttemptResponseDto>>> DispatchPending()
    {
        var results = await _notificationDispatchService.DispatchPendingAsync();

        return Ok(results);
    }
}