using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class DuressBudgetService(AppDbContext db)
{
    public const string VerificationMessage = "For your security, this transaction requires additional verification. Please wait while we confirm the details.";

    public static decimal Calculate(decimal balance) =>
        Math.Clamp(Math.Round(balance * 0.07m, 2, MidpointRounding.AwayFromZero), 200m, 50000m);

    // Called only when creating a new duress session. Never recompute on spending.
    public static async Task InitializeAsync(AppDbContext db, UserSession session)
    {
        var accounts = await db.BankAccounts.Where(x => x.UserId == session.UserId && x.Status == AccountStatus.Active)
            .OrderBy(x => x.AccountName).ToListAsync();
        var main = accounts.FirstOrDefault(x => x.AccountType == AccountType.Cheque) ?? accounts.FirstOrDefault();
        var existing = await db.Beneficiaries.Where(x => x.UserId == session.UserId && !x.CreatedUnderDuress)
            .Select(x => x.Id).ToListAsync();
        var amount = main == null ? 0 : Calculate(main.AvailableBalance);
        db.DuressBudgets.Add(new DuressBudget
        {
            UserSessionId = session.Id,
            BankAccountId = main?.Id,
            OriginalBalance = amount,
            RemainingBalance = amount,
            ExistingBeneficiaryIdsJson = JsonSerializer.Serialize(existing),
        });
    }

    public Task<DuressBudget?> GetAsync(Guid sessionId) =>
        db.DuressBudgets.SingleOrDefaultAsync(x => x.UserSessionId == sessionId);

    public async Task ApplyAsync(BankTransaction transaction, BankAccount account)
    {
        var budget = await GetAsync(transaction.UserSessionId);
        if (!CheckFunds(transaction, account, budget) || budget == null) return;
        var newBeneficiary = transaction.BeneficiaryId.HasValue && await db.Beneficiaries.AnyAsync(
            x => x.Id == transaction.BeneficiaryId && x.UserId == transaction.UserId && x.CreatedUnderDuress);
        if (newBeneficiary && transaction.Amount > budget.OriginalBalance * 0.5m)
        {
            transaction.Status = TransactionStatus.Pending;
            transaction.StatusReason = VerificationMessage;
            return;
        }
        Debit(transaction, account, budget);
    }

    public static bool CheckFunds(BankTransaction transaction, BankAccount account, DuressBudget? budget)
    {
        var remaining = budget?.BankAccountId == account.Id ? Math.Max(0, budget.RemainingBalance) : 0;
        // Tier 3 must run before beneficiary/tier checks, including at review time.
        if (budget == null || transaction.Amount > remaining || transaction.Amount <= 0)
        {
            transaction.Status = TransactionStatus.Failed;
            transaction.StatusReason = $"Insufficient Funds. Your available balance is R{remaining.ToString("N2", CultureInfo.GetCultureInfo("en-ZA"))}. This transfer exceeds your available balance.";
            return false;
        }
        if (account.Status != AccountStatus.Active || transaction.Amount > account.AvailableBalance)
        {
            transaction.Status = TransactionStatus.Failed;
            transaction.StatusReason = "This transaction could not be processed. Please contact your bank.";
            return false;
        }
        return true;
    }

    public static void Debit(BankTransaction transaction, BankAccount account, DuressBudget budget)
    {
        budget.RemainingBalance -= transaction.Amount;
        account.AvailableBalance -= transaction.Amount;
        account.CurrentBalance -= transaction.Amount;
        account.UpdatedAt = DateTime.UtcNow;
        transaction.Status = TransactionStatus.DecoyApproved;
        transaction.StatusReason = null;
        transaction.SecureEscapeCode = $"SE-{transaction.UserSessionId:N}-{DateTime.UtcNow:yyyyMMddHHmmss}";
    }
}
