using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Services;

public class DuressReviewService(AppDbContext db)
{
    public async Task<bool> ReviewAsync(Guid sessionId, Guid transactionId, bool approve, CurrentAdminContext admin)
    {
        if (admin.AdminRole is not ("FraudAnalyst" or "FraudManager" or "SystemAdmin"))
            throw new UnauthorizedAccessException();
        var session = await db.UserSessions.Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Id == sessionId && x.Mode == SessionMode.Duress);
        if (session == null || (admin.AdminRole != "SystemAdmin" &&
            (!admin.BankIntegrationId.HasValue || session.User?.BankIntegrationId != admin.BankIntegrationId)))
            return false;
        if (admin.AdminRole == "FraudAnalyst" && session.AssignedAdminUserId != admin.AdminUserId)
            throw new UnauthorizedAccessException();
        var transaction = await db.BankTransactions.Include(x => x.BankAccount).Include(x => x.Beneficiary)
            .SingleOrDefaultAsync(x => x.Id == transactionId && x.UserSessionId == sessionId && x.UserId == session.UserId);
        if (transaction == null) return false;
        if (transaction.Status != TransactionStatus.Pending ||
            transaction.TransactionType is not (TransactionType.Transfer or TransactionType.CashVoucher))
            throw new InvalidOperationException("Only pending duress transactions can be reviewed.");

        if (approve)
        {
            var budget = await db.DuressBudgets.SingleOrDefaultAsync(x => x.UserSessionId == sessionId);
            if (transaction.BankAccount == null || !DuressBudgetService.CheckFunds(transaction, transaction.BankAccount, budget))
            {
                transaction.Status = TransactionStatus.Pending;
                transaction.StatusReason = DuressBudgetService.VerificationMessage;
                throw new InvalidOperationException("The transfer cannot be approved: the account is unavailable or insufficient funds remain. Reject it or leave it pending.");
            }
            DuressBudgetService.Debit(transaction, transaction.BankAccount, budget!);
            if (transaction.Beneficiary != null) transaction.Beneficiary.LastPaidAt = DateTime.UtcNow;
        }
        else
        {
            transaction.Status = TransactionStatus.Failed;
            transaction.StatusReason = "Verification could not be completed. This transfer was not processed.";
        }
        transaction.UpdatedAt = DateTime.UtcNow;
        db.AuditLogs.Add(new Models.AuditLog
        {
            Id = Guid.NewGuid(), EventType = AuditEventType.TransactionEvaluated,
            EntityType = "BankTransaction", EntityId = transaction.Id,
            UserId = transaction.UserId, UserSessionId = sessionId, AdminUserId = admin.AdminUserId,
            MetadataJson = JsonSerializer.Serialize(new { decision = approve ? "approved" : "rejected" }),
            CreatedAt = DateTime.UtcNow,
        });
        // Budget, account, status and audit commit together. Concurrency tokens
        // prevent repeated approvals and simultaneous transfers overdrawing funds.
        await db.SaveChangesAsync();
        return true;
    }
}
