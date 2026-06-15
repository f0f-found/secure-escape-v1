using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/beneficiaries")]
public class BeneficiaryController : ControllerBase
{
    private readonly IBeneficiaryService _service;

    public BeneficiaryController(IBeneficiaryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<BeneficiaryResponseDto>>> GetAll()
    {
        var beneficiaries = await _service.GetAllAsync();
        return Ok(beneficiaries);
    }

    [HttpPost]
    public async Task<ActionResult<BeneficiaryResponseDto>> Add(
     [FromBody] AddBeneficiaryRequestDto request)
    {
        try
        {
            var beneficiary = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetAll), beneficiary);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var success = await _service.DeactivateAsync(id);
        if (!success) return NotFound(new { message = "Beneficiary not found." });
        return NoContent();
    }
}