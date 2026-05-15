using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class ApiClient
    {
        public Guid Id { get; set; }

        [Required]
        public Guid BankIntegrationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ClientId { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string ClientSecretHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Scopes { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public ApiClientStatus Status { get; set; } = ApiClientStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastUsedAt { get; set; }

        public BankIntegration? BankIntegration { get; set; }
    }
}