using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class UserSession
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [MaxLength(100)]
        public string BankSessionId { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public SessionMode Mode { get; set; } = SessionMode.Normal;

        [Required]
        [MaxLength(30)]
        public SessionStatus Status { get; set; } = SessionStatus.Active;

        [MaxLength(100)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(255)]
        public string DeviceInfo { get; set; } = string.Empty;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public CaseStatus CaseStatus { get; set; } = CaseStatus.Open;

        public DateTime? CaseResolvedAt { get; set; }
        
        public User? User { get; set; }
        
        public ICollection<AlertAction> AlertActions { get; set; } = new List<AlertAction>();

        public ICollection<BankTransaction> Transactions { get; set; } = new List<BankTransaction>();

        public ICollection<Alert> Alerts { get; set; } = new List<Alert>();

        public ICollection<LocationEvent> LocationEvents { get; set; } = new List<LocationEvent>();

        public ICollection<RiskEvaluation> RiskEvaluations { get; set; } = new List<RiskEvaluation>();

        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}