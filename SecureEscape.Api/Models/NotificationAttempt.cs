using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class NotificationAttempt
    {
        public Guid Id { get; set; }

        [Required]
        public Guid AlertId { get; set; }

        public NotificationChannel Channel { get; set; }

        [Required]
        [MaxLength(255)]
        public string Destination { get; set; } = string.Empty;

        public NotificationStatus Status { get; set; } = NotificationStatus.Pending;

        [MaxLength(1000)]
        public string ErrorMessage { get; set; } = string.Empty;

        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Alert? Alert { get; set; }
    }
}