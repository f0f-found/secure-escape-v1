using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services;

/// <summary>Releases Tier 2 payments only after their duress holding period.</summary>
public sealed class DelayedDuressTransferReleaseService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DelayedDuressTransferReleaseService> _logger;

    public DelayedDuressTransferReleaseService(
        IServiceScopeFactory scopeFactory,
        ILogger<DelayedDuressTransferReleaseService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

        do
        {
            try
            {
                await ReleaseDueTransfersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not release delayed duress transfers.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task ReleaseDueTransfersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var transactions = scope.ServiceProvider.GetRequiredService<ITransactionRepository>();
        var accounts = scope.ServiceProvider.GetRequiredService<IBankAccountRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dueTransactions = await transactions.GetDueDelayedTransactionsAsync(DateTime.UtcNow);

        foreach (var transaction in dueTransactions)
        {
            var account = transaction.BankAccount;
            if (account == null || account.AvailableBalance < transaction.Amount)
            {
                transaction.Status = TransactionStatus.Failed;
                transaction.StatusReason = "Insufficient funds.";
            }
            else
            {
                account.AvailableBalance -= transaction.Amount;
                account.CurrentBalance -= transaction.Amount;
                account.UpdatedAt = DateTime.UtcNow;
                transaction.Status = TransactionStatus.DecoyApproved;
                transaction.StatusReason = null;
                transaction.UpdatedAt = DateTime.UtcNow;
                await accounts.UpdateAsync(account);
            }

            await transactions.UpdateAsync(transaction);
        }

        if (dueTransactions.Count > 0)
            await unitOfWork.SaveChangesAsync();
    }
}
