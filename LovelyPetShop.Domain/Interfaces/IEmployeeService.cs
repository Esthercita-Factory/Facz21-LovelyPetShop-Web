using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IEmployeeService
{
    Task<IEnumerable<Employee>> GetAllEmployeesAsync();
    Task<Employee?> GetEmployeeByIdAsync(string uuid);
    Task<Employee> CreateEmployeeAsync(Employee employee);
    Task<Employee> UpdateEmployeeAsync(string uuid, Employee employee);
    Task<bool> DeleteEmployeeAsync(string uuid);
}
