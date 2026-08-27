using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee?> GetByUuidAsync(string uuid);
    Task AddAsync(Employee employee);
    Task UpdateAsync(Employee employee);
    Task<bool> DeleteByUuidAsync(string uuid);
}
