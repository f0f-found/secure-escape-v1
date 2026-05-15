using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class DecoyProfile
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public DecoyProfileType ProfileType { get; set; } = DecoyProfileType.LowProfile;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DisplayBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EmergencyBudget { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Tier1Limit { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Tier2Limit { get; set; }

        public int Tier2DelayHours { get; set; } = 24;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }
    }
}