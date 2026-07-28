using System.ComponentModel.DataAnnotations;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Request;

public class ManagerReviewCaseRequestDto
{
    [Required]
    public ManagerReviewStatus ReviewStatus { get; set; }

    [MaxLength(2000)]
    public string ReviewNotes { get; set; } = string.Empty;
}