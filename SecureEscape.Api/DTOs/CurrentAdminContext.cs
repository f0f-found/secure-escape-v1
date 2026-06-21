using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SecureEscape.Api.DTOs
{
    public class CurrentAdminContext
    {
        public Guid AdminUserId { get; set; }
        public Guid BankIntegrationId { get; set; }
        public string AdminRole { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}