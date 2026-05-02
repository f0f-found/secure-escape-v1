using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SecureEscape.Api.DTOs.Response
{
    public class LoginResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}