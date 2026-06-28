using SecureEscape.Api.DTOs;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IRiskService
{
    RiskAssessmentResult AssessNormalTransaction(BankTransaction transaction);

    RiskAssessmentResult AssessDuressLogin();

    RiskAssessmentResult AssessDuressTransaction(
        BankTransaction transaction,
        DecoyProfile? decoyProfile);
}