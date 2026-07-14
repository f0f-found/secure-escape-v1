using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SecureEscape.Api.DTOs.Response
{
    /*
        Safe response object we send to the admin 
        dashboard instead of returning the raw 
        LocationEvent model directly.
    */
    public class LocationEventResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserSessionId { get; set; }
        public Guid? AlertId { get; set; }

        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public decimal AccuracyMeters { get; set; }

        public string LocationSource { get; set; } = string.Empty;

        public DateTime CapturedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}