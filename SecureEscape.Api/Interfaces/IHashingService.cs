using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SecureEscape.Api.Interfaces
{
    public interface IHashingService
    {
        string Hash(string value);

        bool Verify(string value, string hash);

    }
}