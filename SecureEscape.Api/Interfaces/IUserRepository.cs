using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
}