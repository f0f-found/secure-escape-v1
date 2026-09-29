using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class RiskZone
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public RiskLevel RiskLevel { get; set; } = RiskLevel.Low;

        [Column(TypeName = "decimal(10,7)")]
        public decimal Latitude { get; set; }

        [Column(TypeName = "decimal(10,7)")]
        public decimal Longitude { get; set; }

        public int RadiusMeters { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal RiskScore { get; set; }

        public int IncidentCount { get; set; }

        public int DuressEventCount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}