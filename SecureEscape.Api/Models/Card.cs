using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class Card
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid BankAccountId { get; set; }

        [Required]
        [MaxLength(30)]
        public CardType CardType { get; set; } = CardType.Debit;

        [Required]
        [MaxLength(4)]
        public string LastFourDigits { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public CardStatus CardStatus { get; set; } = CardStatus.Active;

        public int ExpiryMonth { get; set; }

        public int ExpiryYear { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }

        public BankAccount? BankAccount { get; set; }
    }
}