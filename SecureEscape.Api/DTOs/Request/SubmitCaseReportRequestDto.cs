using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request;

public class SubmitCaseReportRequestDto
{
    [MaxLength(2000)]
    public string InvestigationSummary { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string ResolutionSummary { get; set; } = string.Empty;
}