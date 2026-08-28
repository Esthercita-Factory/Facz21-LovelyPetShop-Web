using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class AuditService : IAuditService
{
    private readonly IAuditRepository _repository;

    public AuditService(IAuditRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AuditLog>> GetLogsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task LogActionAsync(string userName, string userRole, string action, string module, string description, string details = "")
    {
        var log = new AuditLog
        {
            Uuid = Guid.NewGuid().ToString(),
            Timestamp = DateTime.Now,
            UserName = string.IsNullOrWhiteSpace(userName) ? "Sistema" : userName,
            UserRole = string.IsNullOrWhiteSpace(userRole) ? "Staff" : userRole,
            Action = action,
            Module = module,
            Description = description,
            Details = details
        };

        await _repository.AddAsync(log);
    }
}
