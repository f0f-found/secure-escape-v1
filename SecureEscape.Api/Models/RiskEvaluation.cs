using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class RiskEvaluation
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserSessionId { get; set; }

        public Guid? BankTransactionId { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Score { get; set; }

        public RiskLevel RiskLevel { get; set; } = RiskLevel.Low;

        [MaxLength(2000)]
        public string ReasonsJson { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserSession? UserSession { get; set; }

        public BankTransaction? BankTransaction { get; set; }
    }
}