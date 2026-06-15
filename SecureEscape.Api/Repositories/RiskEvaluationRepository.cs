using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Repositories;

public class RiskEvaluationRepository : IRiskEvaluationRepository
{
    private readonly AppDbContext _context;

    public RiskEvaluationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RiskEvaluation riskEvaluation)
    {
        await _context.RiskEvaluations.AddAsync(riskEvaluation);

    }
}