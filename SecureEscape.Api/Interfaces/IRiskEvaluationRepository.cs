using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IRiskEvaluationRepository
{
    Task AddAsync(RiskEvaluation riskEvaluation);
}