using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;

    public EmployeeService(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Employee?> GetEmployeeByIdAsync(string uuid)
    {
        return await _repository.GetByUuidAsync(uuid);
    }

    public async Task<Employee> CreateEmployeeAsync(Employee employee)
    {
        if (string.IsNullOrWhiteSpace(employee.Name))
            throw new ArgumentException("El nombre del empleado es obligatorio.");

        await _repository.AddAsync(employee);
        return employee;
    }

    public async Task<Employee> UpdateEmployeeAsync(string uuid, Employee employee)
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException("Empleado no encontrado.");

        employee.Uuid = uuid;
        await _repository.UpdateAsync(employee);
        return employee;
    }

    public async Task<bool> DeleteEmployeeAsync(string uuid)
    {
        return await _repository.DeleteByUuidAsync(uuid);
    }
}
