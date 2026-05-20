using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AccountService : IAccountService
{
    private readonly IBankAccountRepository _bankAccountRepository;
    private readonly IDecoyProfileRepository _decoyProfileRepository;
    private readonly ICurrentUserService _currentUserService;

    public AccountService(
        IBankAccountRepository bankAccountRepository,
        IDecoyProfileRepository decoyProfileRepository,
        ICurrentUserService currentUserService)
    {
        _bankAccountRepository = bankAccountRepository;
        _decoyProfileRepository = decoyProfileRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<AccountResponseDto>> GetCurrentUserAccountsAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var accounts = await _bankAccountRepository.GetByUserIdAsync(currentUser.UserId);

        var decoyProfile = currentUser.SessionMode == SessionMode.Duress
            ? await _decoyProfileRepository.GetActiveByUserIdAsync(currentUser.UserId)
            : null;

        return accounts
            .Select((account, index) => MapToResponse(account, decoyProfile, index, currentUser.SessionMode))
            .ToList();
    }

    public async Task<AccountResponseDto?> GetCurrentUserAccountByIdAsync(Guid accountId)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var account = await _bankAccountRepository.GetByIdForUserAsync(
            accountId,
            currentUser.UserId);

        if (account == null)
        {
            return null;
        }

        var decoyProfile = currentUser.SessionMode == SessionMode.Duress
            ? await _decoyProfileRepository.GetActiveByUserIdAsync(currentUser.UserId)
            : null;

        return MapToResponse(account, decoyProfile, 0, currentUser.SessionMode);
    }

    private static AccountResponseDto MapToResponse(
        BankAccount account,
        DecoyProfile? decoyProfile,
        int index,
        SessionMode sessionMode)
    {
        var isDuress = sessionMode == SessionMode.Duress;
        var isDecoyView = isDuress && decoyProfile != null;

        var availableBalance = account.AvailableBalance;
        var currentBalance = account.CurrentBalance;

        if (isDecoyView)
        {
            availableBalance = index == 0
                ? decoyProfile!.DisplayBalance
                : 0;

            currentBalance = index == 0
                ? decoyProfile!.DisplayBalance
                : 0;
        }

        return new AccountResponseDto
        {
            Id = account.Id,
            AccountNumber = account.AccountNumber,
            AccountName = account.AccountName,
            AccountType = account.AccountType,
            AvailableBalance = availableBalance,
            CurrentBalance = currentBalance,
            Currency = account.Currency,
            Status = account.Status,
            IsDecoyView = isDecoyView
        };
    }
}