using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class AdminUser
    {
        public Guid Id { get; set; }

        public Guid? BankIntegrationId { get; set; }

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

        public AdminRole AdminRole { get; set; } = AdminRole.SecureEscapeAdmin;

        public AdminUserStatus ActivityStatus { get; set; } = AdminUserStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public BankIntegration? BankIntegration { get; set; }

        public ICollection<AlertAction> AlertActions { get; set; } = new List<AlertAction>();

        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}