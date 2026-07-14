using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class RiskService : IRiskService
{
    public RiskAssessmentResult AssessNormalTransaction(BankTransaction transaction)
    {
        if (transaction.Amount >= 50_000)
        {
            return new RiskAssessmentResult
            {
                Score = 0.65m,
                RiskLevel = RiskLevel.High,
                Reason = "Large normal transaction amount"
            };
        }

        if (transaction.Amount >= 10_000)
        {
            return new RiskAssessmentResult
            {
                Score = 0.45m,
                RiskLevel = RiskLevel.Medium,
                Reason = "Moderate normal transaction amount"
            };
        }

        return new RiskAssessmentResult
        {
            Score = 0.20m,
            RiskLevel = RiskLevel.Low,
            Reason = "Normal transaction"
        };
    }

    public RiskAssessmentResult AssessDuressLogin()
    {
        return new RiskAssessmentResult
        {
            Score = 0.95m,
            RiskLevel = RiskLevel.High,
            Reason = "Duress PIN matched"
        };
    }

    public RiskAssessmentResult AssessDuressTransaction(
        BankTransaction transaction,
        DecoyProfile? decoyProfile)
    {
        if (decoyProfile == null)
        {
            return new RiskAssessmentResult
            {
                Score = 0.99m,
                RiskLevel = RiskLevel.Critical,
                Reason = "Duress transaction without active decoy profile"
            };
        }

        if (transaction.Amount > decoyProfile.EmergencyBudget)
        {
            return new RiskAssessmentResult
            {
                Score = 0.98m,
                RiskLevel = RiskLevel.Critical,
                Reason = "Duress transaction exceeds emergency budget"
            };
        }

        // if (transaction.Amount > decoyProfile.Tier1Limit)
        // {
        //     return new RiskAssessmentResult
        //     {
        //         Score = 0.85m,
        //         RiskLevel = RiskLevel.High,
        //         Reason = "Duress transaction exceeds tier 1 limit"
        //     };
        // }

        return new RiskAssessmentResult
        {
            Score = 0.75m,
            RiskLevel = RiskLevel.High,
            Reason = "Duress transaction within emergency profile"
        };
    }
}