using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/emergency-contacts")]
public class EmergencyContactController : ControllerBase
{
    private readonly IEmergencyContactService _service;

    public EmergencyContactController(
        IEmergencyContactService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<EmergencyContactResponseDto>>> GetAll()
    {
        var contacts = await _service.GetAllAsync();
        return Ok(contacts);
    }

    [HttpPost]
    public async Task<ActionResult<EmergencyContactResponseDto>> Add(
        [FromBody] AddEmergencyContactRequestDto request)
    {
        var contact = await _service.AddAsync(request);

        return CreatedAtAction(
            nameof(GetAll),
            contact);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EmergencyContactResponseDto>> Update(
        Guid id,
        [FromBody] UpdateEmergencyContactRequestDto request)
    {
        var contact = await _service.UpdateAsync(id, request);

        if (contact == null)
        {
            return NotFound(new
            {
                message = "Emergency contact not found."
            });
        }

        return Ok(contact);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Emergency contact not found."
                });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}