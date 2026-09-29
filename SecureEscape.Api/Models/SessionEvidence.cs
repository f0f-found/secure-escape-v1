using System;
using System.ComponentModel.DataAnnotations;

namespace SecureEscape.Api.Models
{
    public class SessionEvidence
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserSessionId { get; set; }

        public Guid? BankTransactionId { get; set; }

        [Required]
        [MaxLength(50)]
        public string EvidenceType { get; set; } = "CurrentPhoto";

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string StoragePath { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = "image/jpeg";

        public long FileSizeBytes { get; set; }

        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserSession? UserSession { get; set; }

        public BankTransaction? BankTransaction { get; set; }
    }
}