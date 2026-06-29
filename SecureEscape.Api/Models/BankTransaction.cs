using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class BankTransaction
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid UserSessionId { get; set; }

        [Required]
        public Guid BankAccountId { get; set; }

        public Guid? BeneficiaryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BankReference { get; set; } = string.Empty;

        public TransactionType TransactionType { get; set; } = TransactionType.Transfer;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "ZAR";

        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
        public string? StatusReason { get; set; }

        public bool Flagged { get; set; } = false;

        public RiskLevel RiskLevel { get; set; } = RiskLevel.Low;

        [Column(TypeName = "decimal(5,2)")]
        public decimal RiskScore { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public string? SecureEscapeCode { get; set; }

        [MaxLength(50)]
        public string? VoucherNumber { get; set; }

        [MaxLength(20)]
        public string? VoucherPin { get; set; }

        public DateTime? VoucherExpiresAt { get; set; }

        public bool VoucherRedeemed { get; set; } = false;
       
        public bool FraudReported { get; set; } = false;

        public DateTime? FraudReportedAt { get; set; }

        public string? FraudReportReference { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }

        public UserSession? UserSession { get; set; }

        public BankAccount? BankAccount { get; set; }

        public Beneficiary? Beneficiary { get; set; }

        public ICollection<RiskEvaluation> RiskEvaluations { get; set; } = new List<RiskEvaluation>();

        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
