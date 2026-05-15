using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class BankAccount
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(30)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        public AccountType AccountType { get; set; } = AccountType.Savings;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AvailableBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "ZAR";

        [Required]
        [MaxLength(30)]
        public AccountStatus Status { get; set; } = AccountStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }

        public ICollection<Card> Cards { get; set; } = new List<Card>();

        public ICollection<BankTransaction> Transactions { get; set; } = new List<BankTransaction>();
    }
}