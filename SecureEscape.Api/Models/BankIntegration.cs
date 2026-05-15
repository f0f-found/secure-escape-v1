using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class BankIntegration
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string BankCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public BankIntegrationStatus Status { get; set; } = BankIntegrationStatus.Active;

        [MaxLength(500)]
        public string WebhookUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();

        public ICollection<ApiClient> ApiClients { get; set; } = new List<ApiClient>();
    }
}