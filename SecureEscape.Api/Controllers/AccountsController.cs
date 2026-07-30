using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/accounts")]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountResponseDto>>> GetAccounts()
    {
        var accounts = await _accountService.GetCurrentUserAccountsAsync();

        return Ok(accounts);
    }

    [HttpGet("{accountId:guid}")]
    public async Task<ActionResult<AccountResponseDto>> GetAccountById(Guid accountId)
    {
        var account = await _accountService.GetCurrentUserAccountByIdAsync(accountId);

        if (account == null)
        {
            return NotFound(new
            {
                message = "Account not found."
            });
        }

        return Ok(account);
    }
}