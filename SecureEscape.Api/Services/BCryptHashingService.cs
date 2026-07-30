using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Services
{
    public class BCryptHashingService : IHashingService
    {
        public string Hash(string value)
        {
            return BCrypt.Net.BCrypt.HashPassword(value);
        }

        public bool Verify(string value, string hash)
        {
            if (string.IsNullOrWhiteSpace(value) || string.IsNullOrWhiteSpace(hash))
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(value, hash);
        }
    }
}