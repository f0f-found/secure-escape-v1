using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Data;
using SecureEscape.Api.Interfaces;

namespace SecureEscape.Api.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}