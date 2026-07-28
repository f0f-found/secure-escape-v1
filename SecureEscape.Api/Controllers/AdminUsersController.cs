using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize(Roles = "FraudManager,SystemAdmin")]
[Route("api/v1/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly ICurrentAdminService _currentAdminService;

    public AdminUsersController(
        IAdminUserService adminUserService,
        ICurrentAdminService currentAdminService)
    {
        _adminUserService = adminUserService;
        _currentAdminService = currentAdminService;
    }

    [HttpGet("analysts")]
    public async Task<ActionResult<List<AdminUserSummaryResponseDto>>> GetAnalysts()
    {
        var currentAdmin = _currentAdminService.GetCurrentAdmin();
        var analysts = await _adminUserService.GetAnalystsAsync(currentAdmin.BankIntegrationId);
        return Ok(analysts);
    }
}