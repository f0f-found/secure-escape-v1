using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/messages")]
    public class MessagesController : ControllerBase
    {
        private readonly IUserMessageService _service;

        public MessagesController(IUserMessageService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserMessageResponseDto>>> GetAll()
        {
            var messages = await _service.GetAllAsync();
            return Ok(messages);
        }

        [HttpPost]
        public async Task<ActionResult<UserMessageResponseDto>> Create(
            [FromBody] CreateUserMessageRequestDto request)
        {
            var message = await _service.CreateAsync(request);

            return Ok(message);
        }

        [HttpPatch("{id:guid}/read")]
        public async Task<ActionResult<UserMessageResponseDto>> MarkAsRead(
            Guid id)
        {
            var message = await _service.MarkAsReadAsync(id);

            if (message == null)
            {
                return NotFound(new
                {
                    message = "Message not found."
                });
            }

            return Ok(message);
        }
    }
}