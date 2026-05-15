using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class AlertAction
    {
        public Guid Id { get; set; }

        [Required]
        public Guid AlertId { get; set; }

        public Guid? AdminUserId { get; set; }

        public AlertActionType ActionType { get; set; }

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Alert? Alert { get; set; }

        public AdminUser? AdminUser { get; set; }
    }
}