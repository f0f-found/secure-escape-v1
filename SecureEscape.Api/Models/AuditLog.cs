using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; }

        public Guid? UserId { get; set; }

        public Guid? UserSessionId { get; set; }

        public Guid? AdminUserId { get; set; }

        public AuditEventType EventType { get; set; }

        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty;

        public Guid? EntityId { get; set; }

        [MaxLength(2000)]
        public string MetadataJson { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }

        public UserSession? UserSession { get; set; }

        public AdminUser? AdminUser { get; set; }
    }
}