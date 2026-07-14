using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class Alert
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid UserSessionId { get; set; }

        public AlertType Type { get; set; } = AlertType.DuressLogin;

        public RiskLevel Severity { get; set; } = RiskLevel.High;

        public AlertStatus Status { get; set; } = AlertStatus.Open;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public User? User { get; set; }

        public UserSession? UserSession { get; set; }

        public ICollection<LocationEvent> LocationEvents { get; set; } = new List<LocationEvent>();

        public ICollection<NotificationAttempt> NotificationAttempts { get; set; } = new List<NotificationAttempt>();

        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}