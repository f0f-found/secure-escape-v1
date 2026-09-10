using SecureEscape.Api.DTOs;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AccountService : IAccountService
{
    private readonly IBankAccountRepository _bankAccountRepository;
    private readonly IDecoyProfileRepository _decoyProfileRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly ICurrentUserService _currentUserService;

    public AccountService(
        IBankAccountRepository bankAccountRepository,
        IDecoyProfileRepository decoyProfileRepository,
        ITransactionRepository transactionRepository,
        IUserSessionRepository userSessionRepository,
        ICurrentUserService currentUserService)
    {
        _bankAccountRepository = bankAccountRepository;
        _decoyProfileRepository = decoyProfileRepository;
        _transactionRepository = transactionRepository;
        _userSessionRepository = userSessionRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<AccountResponseDto>> GetCurrentUserAccountsAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var accounts = await _bankAccountRepository.GetByUserIdAsync(currentUser.UserId);

        var decoyProfile = currentUser.SessionMode == SessionMode.Duress
            ? await _decoyProfileRepository.GetActiveByUserIdAsync(currentUser.UserId)
            : null;

        var (tier1Spent, tier2Committed, initialDecoyBalance) = await GetDuressSpendAsync(currentUser, decoyProfile);

        return accounts
            .Select((account, index) => MapToResponse(
                account, decoyProfile, index, currentUser.SessionMode, tier1Spent, tier2Committed, initialDecoyBalance))
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

        var (tier1Spent, tier2Committed, initialDecoyBalance) = await GetDuressSpendAsync(currentUser, decoyProfile);

        return MapToResponse(account, decoyProfile, 0, currentUser.SessionMode, tier1Spent, tier2Committed, initialDecoyBalance);
    }

    private async Task<(decimal Tier1Spent, decimal Tier2Committed, decimal? InitialDecoyBalance)> GetDuressSpendAsync(
        CurrentUserContext currentUser,
        DecoyProfile? decoyProfile)
    {
        if (currentUser.SessionMode != SessionMode.Duress || decoyProfile == null)
        {
            return (0m, 0m, null);
        }

        var tier1Spent = await _transactionRepository
            .GetImmediateDuressSpendForSessionAsync(currentUser.UserSessionId);
        var tier2Committed = await _transactionRepository
            .GetTier2DuressSpendForSessionAsync(currentUser.UserSessionId);

        var session = await _userSessionRepository.GetByIdAsync(currentUser.UserSessionId);
        return (tier1Spent, tier2Committed, session?.InitialDecoyBalance);
    }

    private static AccountResponseDto MapToResponse(
        BankAccount account,
        DecoyProfile? decoyProfile,
        int index,
        SessionMode sessionMode,
        decimal tier1Spent,
        decimal tier2Committed,
        decimal? initialDecoyBalance)
    {
        var isDuress = sessionMode == SessionMode.Duress;
        var isDecoyView = isDuress && decoyProfile != null;

        var availableBalance = account.AvailableBalance;
        var currentBalance = account.CurrentBalance;

        if (isDecoyView)
        {
            // Low Profile is a fixed small balance. Custom is the realistic
            // profile: show 7.5% of the real balance, rounded to R100, while
            // never showing less than the immediate Tier 1 amount.
            var configuredDecoyBalance = initialDecoyBalance ?? (decoyProfile!.ProfileType == DecoyProfileType.Custom
                ? CalculateRealisticDecoyBalance(account.CurrentBalance, decoyProfile.Tier1Limit)
                : decoyProfile.DisplayBalance);

            var decoyAvailableBalance = Math.Max(
                0,
                Math.Min(configuredDecoyBalance - tier1Spent - tier2Committed, account.AvailableBalance)
            );

            availableBalance = index == 0
                ? decoyAvailableBalance
                : 0;

            currentBalance = index == 0
                ? decoyAvailableBalance
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

    private static decimal CalculateRealisticDecoyBalance(decimal realBalance, decimal tier1Limit)
    {
        var percentageAmount = Math.Round(
            (realBalance * 0.075m) / 100m,
            0,
            MidpointRounding.AwayFromZero) * 100m;
        return Math.Min(realBalance, Math.Max(tier1Limit, percentageAmount));
    }
}
