using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.DTOs.Request
{
    public class CreateUserMessageRequestDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Body { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = "General";

        [MaxLength(100)]
        public string? ReferenceType { get; set; }

        [MaxLength(100)]
        public string? ReferenceId { get; set; }

        [MaxLength(200)]
        public string? DeduplicationKey { get; set; }
    }
}