using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IAuditRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
    Task AddAsync(AuditLog log);
}
