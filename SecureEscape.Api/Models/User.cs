using System.ComponentModel.DataAnnotations;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        public Guid BankIntegrationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BankCustomerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public UserStatus Status { get; set; } = UserStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public BankIntegration? BankIntegration { get; set; }

        public AuthCredential? AuthCredential { get; set; }

        public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
        public ICollection<EmergencyContact> EmergencyContacts { get; set; } = new List<EmergencyContact>();

        public ICollection<Card> Cards { get; set; } = new List<Card>();

        public ICollection<Beneficiary> Beneficiaries { get; set; } = new List<Beneficiary>();

        public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();

        public ICollection<DecoyProfile> DecoyProfiles { get; set; } = new List<DecoyProfile>();

        public ICollection<Alert> Alerts { get; set; } = new List<Alert>();

        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
