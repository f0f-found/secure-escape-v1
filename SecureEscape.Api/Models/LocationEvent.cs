using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class LocationEvent
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserSessionId { get; set; }

        public Guid? AlertId { get; set; }

        [Column(TypeName = "decimal(10,7)")]
        public decimal Latitude { get; set; }

        [Column(TypeName = "decimal(10,7)")]
        public decimal Longitude { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal AccuracyMeters { get; set; }

        public LocationSource LocationSource { get; set; } = LocationSource.Gps;

        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserSession? UserSession { get; set; }

        public Alert? Alert { get; set; }
    }
}