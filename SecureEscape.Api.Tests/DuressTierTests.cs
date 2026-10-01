using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using SecureEscape.Api.Repositories;
using SecureEscape.Api.Services;
using Xunit;

namespace SecureEscape.Api.Tests;

public class DuressTierTests
{
    private static readonly Guid NewBeneficiaryId = Guid.Parse("a0000000-0000-0000-0000-000000000001");
    private static AppDbContext Context(string? name = null) => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(name ?? Guid.NewGuid().ToString()).Options);

    private static async Task<(UserSession session, BankAccount account, DuressBudget budget)> Seed(AppDbContext db)
    {
        var user = new User { Id = Guid.NewGuid(), BankIntegrationId = Guid.NewGuid() };
        var session = new UserSession { Id = Guid.NewGuid(), UserId = user.Id, User = user, Mode = SessionMode.Duress };
        var account = new BankAccount { Id = Guid.NewGuid(), UserId = user.Id, AvailableBalance = 2000000, CurrentBalance = 2000000 };
        db.Users.Add(user);
        db.UserSessions.Add(session);
        db.BankAccounts.Add(account);
        db.Beneficiaries.Add(new Beneficiary { Id = NewBeneficiaryId, UserId = user.Id, CreatedUnderDuress = true });
        var budget = new DuressBudget { UserSessionId = session.Id, BankAccountId = account.Id, OriginalBalance = 50000, RemainingBalance = 50000 };
        db.DuressBudgets.Add(budget);
        await db.SaveChangesAsync();
        return (session, account, budget);
    }

    private static BankTransaction Transfer(UserSession session, BankAccount account, decimal amount, Guid? beneficiary = null) => new()
    {
        Id = Guid.NewGuid(), UserId = session.UserId, UserSessionId = session.Id,
        BankAccountId = account.Id, BeneficiaryId = beneficiary ?? NewBeneficiaryId,
        Amount = amount, TransactionType = TransactionType.Transfer,
    };

    private static BankTransaction CashSend(UserSession session, BankAccount account, decimal amount) => new()
    {
        Id = Guid.NewGuid(), UserId = session.UserId, UserSessionId = session.Id,
        BankAccountId = account.Id, Amount = amount, TransactionType = TransactionType.CashVoucher,
    };

    [Theory]
    [InlineData(0, 200)]
    [InlineData(1000, 200)]
    [InlineData(5000, 350)]
    [InlineData(2000000, 50000)]
    public void CalculatesBoundedDecoy(decimal real, decimal expected) => DuressBudgetService.Calculate(real).Should().Be(expected);

    [Fact]
    public async Task RealisticDecoyUsesTwentyPercentAndCapsSpendingAtThirtyPercent()
    {
        await using var db = Context();
        var (session, account, oldBudget) = await Seed(db);
        db.DuressBudgets.Remove(oldBudget);
        db.DecoyProfiles.Add(new DecoyProfile
        {
            Id = Guid.NewGuid(),
            UserId = session.UserId,
            ProfileType = DecoyProfileType.Custom,
            IsActive = true,
        });
        await db.SaveChangesAsync();

        await DuressBudgetService.InitializeAsync(db, session);
        await db.SaveChangesAsync();
        var budget = await db.DuressBudgets.FindAsync(session.Id);
        budget!.OriginalBalance.Should().Be(400000);
        budget.BankAccountId.Should().Be(account.Id);
        budget.RemainingSpendingLimit.Should().Be(120000);
        budget.PendingThresholdRate.Should().Be(0.30m);

        var first = Transfer(session, account, 30000);
        await new DuressBudgetService(db).ApplyAsync(first, account);
        first.Status.Should().Be(TransactionStatus.DecoyApproved);

        var second = Transfer(session, account, 20000);
        await new DuressBudgetService(db).ApplyAsync(second, account);
        second.Status.Should().Be(TransactionStatus.DecoyApproved);
        budget.RemainingSpendingLimit.Should().Be(70000);

        var overCap = Transfer(session, account, 120001);
        await new DuressBudgetService(db).ApplyAsync(overCap, account);
        overCap.Status.Should().Be(TransactionStatus.Pending);
        budget.RemainingSpendingLimit.Should().Be(70000);
    }

    [Fact]
    public async Task CashSendAboveModeThresholdIsHeldForSecurityReview()
    {
        await using var db = Context();
        var (session, account, oldBudget) = await Seed(db);
        db.DuressBudgets.Remove(oldBudget);
        db.DecoyProfiles.Add(new DecoyProfile
        {
            Id = Guid.NewGuid(),
            UserId = session.UserId,
            ProfileType = DecoyProfileType.Custom,
            DisplayBalance = 400000,
            EmergencyBudget = 400000,
            IsActive = true,
        });
        await db.SaveChangesAsync();
        await DuressBudgetService.InitializeAsync(db, session);
        await db.SaveChangesAsync();

        var cashSend = CashSend(session, account, 120001);
        await new DuressBudgetService(db).ApplyAsync(cashSend, account);

        cashSend.Status.Should().Be(TransactionStatus.Pending);
        cashSend.StatusReason.Should().Be(DuressBudgetService.VerificationMessage);
        account.AvailableBalance.Should().Be(2000000);
    }

    [Fact]
    public async Task DuressSessionPreservesConfiguredDisplayAmount()
    {
        await using var db = Context();
        var (session, account, oldBudget) = await Seed(db);
        db.DuressBudgets.Remove(oldBudget);
        db.DecoyProfiles.Add(new DecoyProfile
        {
            Id = Guid.NewGuid(),
            UserId = session.UserId,
            ProfileType = DecoyProfileType.LowProfile,
            DisplayBalance = 7504,
            EmergencyBudget = 7504,
            IsActive = true,
        });
        await db.SaveChangesAsync();

        await DuressBudgetService.InitializeAsync(db, session);
        await db.SaveChangesAsync();
        var budget = await db.DuressBudgets.FindAsync(session.Id);

        budget!.OriginalBalance.Should().Be(7504);
        budget.RemainingBalance.Should().Be(7504);
    }

    [Fact]
    public async Task UserExample_PendingThenImmediateThenInsufficient()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var service = new DuressBudgetService(db);
        var beneficiary = NewBeneficiaryId;
        var pending = Transfer(session, account, 50000, beneficiary);
        await service.ApplyAsync(pending, account);
        pending.Status.Should().Be(TransactionStatus.Pending);
        budget.RemainingBalance.Should().Be(50000);
        account.AvailableBalance.Should().Be(2000000);

        var immediate = Transfer(session, account, 25000, beneficiary);
        await service.ApplyAsync(immediate, account);
        immediate.Status.Should().Be(TransactionStatus.DecoyApproved);
        budget.RemainingBalance.Should().Be(25000);
        budget.OriginalBalance.Should().Be(50000);
        account.AvailableBalance.Should().Be(1975000);

        var failed = Transfer(session, account, 50000, beneficiary);
        await service.ApplyAsync(failed, account);
        failed.Status.Should().Be(TransactionStatus.Failed);
        failed.StatusReason.Should().StartWith("Insufficient protected spending balance.").And.NotContain("1975000");
        budget.RemainingBalance.Should().Be(25000);
    }

    [Theory]
    [InlineData(25000, TransactionStatus.DecoyApproved)]
    [InlineData(25000.01, TransactionStatus.Pending)]
    [InlineData(50000.01, TransactionStatus.Failed)]
    public async Task ExactTierBoundaries(decimal amount, TransactionStatus expected)
    {
        await using var db = Context();
        var (session, account, _) = await Seed(db);
        var tx = Transfer(session, account, amount);
        await new DuressBudgetService(db).ApplyAsync(tx, account);
        tx.Status.Should().Be(expected);
    }

    [Fact]
    public async Task NewBeneficiaryRemainsNew_AndThresholdUsesOriginal()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var beneficiary = NewBeneficiaryId;
        var service = new DuressBudgetService(db);
        await service.ApplyAsync(Transfer(session, account, 1000, beneficiary), account);
        var large = Transfer(session, account, 26000, beneficiary);
        await service.ApplyAsync(large, account);
        large.Status.Should().Be(TransactionStatus.Pending);
        var halfOriginal = Transfer(session, account, 25000, beneficiary);
        await service.ApplyAsync(halfOriginal, account);
        halfOriginal.Status.Should().Be(TransactionStatus.DecoyApproved);
        budget.RemainingBalance.Should().Be(24000);
    }

    [Fact]
    public async Task ExistingBeneficiaryAlsoRequiresReviewAboveThreshold()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var beneficiary = Guid.NewGuid();
        db.Beneficiaries.Add(new Beneficiary { Id = beneficiary, UserId = session.UserId, CreatedUnderDuress = false });
        await db.SaveChangesAsync();
        budget.ExistingBeneficiaryIdsJson = JsonSerializer.Serialize(new[] { beneficiary });
        var service = new DuressBudgetService(db);
        var first = Transfer(session, account, 40000, beneficiary);
        await service.ApplyAsync(first, account);
        first.Status.Should().Be(TransactionStatus.Pending);
        var second = Transfer(session, account, 10001, beneficiary);
        await service.ApplyAsync(second, account);
        second.Status.Should().Be(TransactionStatus.DecoyApproved);
    }

    [Fact]
    public async Task MissingBudgetFailsClosed_AndOtherAccountsCannotBypassBudget()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        budget.BankAccountId = Guid.NewGuid();
        var service = new DuressBudgetService(db);
        var other = Transfer(session, account, 1);
        await service.ApplyAsync(other, account);
        other.Status.Should().Be(TransactionStatus.Failed);
        db.DuressBudgets.Remove(budget);
        await db.SaveChangesAsync();
        var missing = Transfer(session, account, 1);
        await service.ApplyAsync(missing, account);
        missing.Status.Should().Be(TransactionStatus.Failed);
        account.AvailableBalance.Should().Be(2000000);
    }

    [Fact]
    public async Task AccountListAndDetailHideRealBalances_EvenWithoutBudget()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var other = new BankAccount { Id = Guid.NewGuid(), UserId = session.UserId, AccountName = "Other", AvailableBalance = 999999 };
        db.BankAccounts.Add(other);
        await db.SaveChangesAsync();
        var current = new Mock<ICurrentUserService>();
        current.Setup(x => x.GetCurrentUser()).Returns(new CurrentUserContext { UserId = session.UserId, UserSessionId = session.Id, SessionMode = SessionMode.Duress });
        var service = new AccountService(new BankAccountRepository(db), Mock.Of<IDecoyProfileRepository>(), current.Object, new DuressBudgetService(db));
        (await service.GetCurrentUserAccountsAsync()).Single(x => x.Id == account.Id).AvailableBalance.Should().Be(50000);
        (await service.GetCurrentUserAccountByIdAsync(other.Id))!.AvailableBalance.Should().Be(0);
        db.DuressBudgets.Remove(budget);
        await db.SaveChangesAsync();
        (await service.GetCurrentUserAccountByIdAsync(account.Id))!.AvailableBalance.Should().Be(0);
    }

    [Fact]
    public async Task ConcurrentBudgetDebitsRejectStaleWrite()
    {
        var name = Guid.NewGuid().ToString();
        await using var first = Context(name);
        var (session, _, _) = await Seed(first);
        await using var second = Context(name);
        var one = await first.DuressBudgets.SingleAsync();
        var two = await second.DuressBudgets.SingleAsync();
        one.RemainingBalance -= 30000;
        two.RemainingBalance -= 30000;
        await first.SaveChangesAsync();
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());
        await using var check = Context(name);
        (await check.DuressBudgets.FindAsync(session.Id))!.RemainingBalance.Should().Be(20000);
    }

    [Fact]
    public async Task ReviewApprovesOnce_AndRejectDoesNotDebit()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var approve = Transfer(session, account, 30000);
        var reject = Transfer(session, account, 30000);
        db.BankTransactions.AddRange(approve, reject);
        await db.SaveChangesAsync();
        var admin = new CurrentAdminContext { AdminUserId = Guid.NewGuid(), AdminRole = "SystemAdmin" };
        var service = new DuressReviewService(db);
        (await service.ReviewAsync(session.Id, approve.Id, true, admin)).Should().BeTrue();
        budget.RemainingBalance.Should().Be(20000);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewAsync(session.Id, approve.Id, true, admin));
        await service.ReviewAsync(session.Id, reject.Id, false, admin);
        reject.Status.Should().Be(TransactionStatus.Failed);
        budget.RemainingBalance.Should().Be(20000);
        db.AuditLogs.Count().Should().Be(2);
    }

    [Fact]
    public async Task ReviewCannotBypassRemainingFundsOrBankScope()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var pending = Transfer(session, account, 50000);
        db.BankTransactions.Add(pending);
        budget.RemainingBalance = 25000;
        await db.SaveChangesAsync();
        var service = new DuressReviewService(db);
        var admin = new CurrentAdminContext { AdminUserId = Guid.NewGuid(), AdminRole = "FraudManager", BankIntegrationId = Guid.NewGuid() };
        (await service.ReviewAsync(session.Id, pending.Id, true, admin)).Should().BeFalse();
        admin.AdminRole = "SystemAdmin";
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewAsync(session.Id, pending.Id, true, admin));
        pending.Status.Should().Be(TransactionStatus.Pending);
        budget.RemainingBalance.Should().Be(25000);
        account.AvailableBalance.Should().Be(2000000);
    }

    [Fact]
    public async Task DuressCreatedBeneficiaryStaysNewAcrossSessions_EvenAfterPayment()
    {
        await using var db = Context();
        var (oldSession, account, _) = await Seed(db);
        var paid = Transfer(oldSession, account, 10);
        paid.Status = TransactionStatus.Approved;
        paid.CreatedAt = DateTime.UtcNow.AddDays(-1);
        var failed = Transfer(oldSession, account, 10);
        failed.Status = TransactionStatus.Failed;
        failed.CreatedAt = paid.CreatedAt;
        db.BankTransactions.AddRange(paid, failed);
        await db.SaveChangesAsync();
        var fresh = new UserSession { Id = Guid.NewGuid(), UserId = oldSession.UserId, Mode = SessionMode.Duress };
        db.UserSessions.Add(fresh);
        await DuressBudgetService.InitializeAsync(db, fresh);
        await db.SaveChangesAsync();
        var budget = await db.DuressBudgets.FindAsync(fresh.Id);
        budget!.OriginalBalance.Should().Be(50000);
        var repeat = Transfer(fresh, account, 30000);
        await new DuressBudgetService(db).ApplyAsync(repeat, account);
        repeat.Status.Should().Be(TransactionStatus.Pending);
    }

    [Fact]
    public async Task UnassignedAnalystCannotReview_AndFrozenAccountCannotBeApproved()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        var tx = Transfer(session, account, 30000);
        db.BankTransactions.Add(tx);
        await db.SaveChangesAsync();
        var analyst = new CurrentAdminContext { AdminUserId = Guid.NewGuid(), AdminRole = "FraudAnalyst", BankIntegrationId = session.User!.BankIntegrationId };
        var service = new DuressReviewService(db);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ReviewAsync(session.Id, tx.Id, true, analyst));
        session.AssignedAdminUserId = analyst.AdminUserId;
        account.Status = AccountStatus.Frozen;
        await db.SaveChangesAsync();
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewAsync(session.Id, tx.Id, true, analyst));
        tx.Status.Should().Be(TransactionStatus.Pending);
        budget.RemainingBalance.Should().Be(50000);
    }

    [Fact]
    public async Task Ayanda_295Pays_Then1000RequiresVerification()
    {
        await using var db = Context();
        var (session, account, budget) = await Seed(db);
        account.AvailableBalance = account.CurrentBalance = 18500;
        budget.OriginalBalance = budget.RemainingBalance = DuressBudgetService.Calculate(18500);
        await db.SaveChangesAsync();
        var service = new DuressBudgetService(db);
        var first = Transfer(session, account, 295);
        await service.ApplyAsync(first, account);
        first.Status.Should().Be(TransactionStatus.DecoyApproved);
        var beneficiary = await db.Beneficiaries.FindAsync(NewBeneficiaryId);
        beneficiary!.LastPaidAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        var second = Transfer(session, account, 1000);
        await service.ApplyAsync(second, account);
        second.Status.Should().Be(TransactionStatus.Pending);
        budget.OriginalBalance.Should().Be(1295);
        budget.RemainingBalance.Should().Be(1000);
        account.AvailableBalance.Should().Be(18205);
        beneficiary.CreatedUnderDuress.Should().BeTrue();
    }
}
