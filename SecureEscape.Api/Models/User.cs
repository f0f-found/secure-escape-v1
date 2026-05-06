using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PinHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string DuressPinHash { get; set; } = string.Empty;

        public bool IsUnderDuress { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
