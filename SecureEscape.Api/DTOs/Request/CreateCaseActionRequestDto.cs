using System.ComponentModel.DataAnnotations;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.DTOs.Request;

public class CreateCaseActionRequestDto
{
    public AlertActionType ActionType { get; set; }

    [MaxLength(1000)]
    public string Notes { get; set; } = string.Empty;
}