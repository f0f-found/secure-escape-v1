using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/transactions")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionController(ITransactionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransactionResponseDto>>> GetAll()
    {
        var transactions = await _service.GetAllAsync();
        return Ok(transactions);
    }

    [HttpPost("preflight")]
    public async Task<ActionResult<object>> Preflight(
        [FromBody] TransactionPreflightRequestDto request)
    {
        return Ok(new
        {
            requiresAdditionalVerification =
                await _service.RequiresAdditionalVerificationAsync(request)
        });
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponseDto>> Create(
        [FromBody] CreateTransactionRequestDto request)
    {
        try
        {
            var transaction = await _service.CreateAsync(request);
            return Ok(transaction);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "Your available balance has changed. Please refresh and try again." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("cash-send")]
    public async Task<ActionResult<CashSendResponseDto>> CreateCashSend(
        [FromBody] CreateCashSendRequestDto request)
    {
        try
        {
            var result = await _service.CreateCashSendAsync(request);
            return Ok(result);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "Your available balance has changed. Please refresh and try again." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
