using SecureEscape.Api.DTOs;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IFraudReportingService
{
    Task<FraudReportResult> ReportDuressTransactionAsync(
        BankTransaction transaction,
        Guid userId,
        Guid userSessionId);
}