using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IAuditService
{
    Task<IEnumerable<AuditLog>> GetLogsAsync();
    Task LogActionAsync(string userName, string userRole, string action, string module, string description, string details = "");
}
