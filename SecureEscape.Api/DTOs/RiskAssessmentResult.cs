using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs;

public class RiskAssessmentResult
{
    public decimal Score { get; set; }

    public RiskLevel RiskLevel { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string ReasonsJson =>
        $"{{\"reason\":\"{Reason}\",\"score\":{Score},\"riskLevel\":\"{RiskLevel}\"}}";
}