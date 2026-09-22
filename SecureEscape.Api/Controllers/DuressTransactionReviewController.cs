using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Services;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudAnalyst,FraudManager,SystemAdmin")]
[Route("api/v1/admin/duress-sessions/{sessionId:guid}/transactions/{transactionId:guid}")]
public class DuressTransactionReviewController(DuressReviewService service, ICurrentAdminService currentAdmin) : ControllerBase
{
    public record ReviewRequest(bool Approve);

    [HttpPost("review")]
    public async Task<IActionResult> Review(Guid sessionId, Guid transactionId, ReviewRequest request)
    {
        try
        {
            return await service.ReviewAsync(sessionId, transactionId, request.Approve, currentAdmin.GetCurrentAdmin())
                ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "The transaction or balance changed. Refresh before reviewing again." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
