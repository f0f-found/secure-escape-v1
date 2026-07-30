using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SecureEscape.Api.DTOs
{
    public class FraudReportResult
    {
        public bool Reported { get; set; }

        public DateTime? ReportedAt { get; set; }

        public string? Reference { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}