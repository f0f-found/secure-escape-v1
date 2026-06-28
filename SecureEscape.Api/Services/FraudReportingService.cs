using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class FraudReportingService : IFraudReportingService
{
    private readonly IAuditService _auditService;

    public FraudReportingService(IAuditService auditService)
    {
        _auditService = auditService;
    }

    public async Task<FraudReportResult> ReportDuressTransactionAsync(
        BankTransaction transaction,
        Guid userId,
        Guid userSessionId)
    {
        if (transaction.Status == TransactionStatus.Blocked)
        {
            return new FraudReportResult
            {
                Reported = false,
                Message = "Blocked transaction was not sent to external fraud reporting."
            };
        }

        var now = DateTime.UtcNow;
        var reference = $"SIM-FRAUD-{Guid.NewGuid():N}"[..20].ToUpper();

        await _auditService.LogAsync(
            AuditEventType.FraudReported,
            entityType: "BankTransaction",
            entityId: transaction.Id,
            userId: userId,
            userSessionId: userSessionId,
            metadataJson:
                $"{{\"provider\":\"SimulatedFraudGateway\",\"reference\":\"{reference}\"}}");

        return new FraudReportResult
        {
            Reported = true,
            ReportedAt = now,
            Reference = reference,
            Message = "Duress transaction reported through simulated fraud gateway."
        };
    }
}