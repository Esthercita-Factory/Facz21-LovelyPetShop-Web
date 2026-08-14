using LovelyPetShop.Business.Services;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Xunit;

namespace LovelyPetShop.Tests;

public class FakeProductRepository : IProductRepository
{
    private readonly List<Product> _products = new();

    public Task<IEnumerable<Product>> GetAllAsync() => Task.FromResult<IEnumerable<Product>>(_products);
    public Task<Product?> GetByUuidAsync(string uuid) => Task.FromResult(_products.FirstOrDefault(p => p.Uuid == uuid));
    public Task AddAsync(Product product)
    {
        product.Uuid = Guid.NewGuid().ToString();
        _products.Add(product);
        return Task.CompletedTask;
    }
    public Task UpdateAsync(Product product)
    {
        var existing = _products.FirstOrDefault(p => p.Uuid == product.Uuid);
        if (existing != null)
        {
            _products.Remove(existing);
            _products.Add(product);
        }
        return Task.CompletedTask;
    }
    public Task DeleteAsync(string uuid)
    {
        var existing = _products.FirstOrDefault(p => p.Uuid == uuid);
        if (existing != null) _products.Remove(existing);
        return Task.CompletedTask;
    }
}

public class FakeEmployeeRepository : IEmployeeRepository
{
    private readonly List<Employee> _employees = new();

    public Task<IEnumerable<Employee>> GetAllAsync() => Task.FromResult<IEnumerable<Employee>>(_employees);
    public Task<Employee?> GetByUuidAsync(string uuid) => Task.FromResult(_employees.FirstOrDefault(e => e.Uuid == uuid));
    public Task<Employee?> GetByDocumentNumberAsync(string documentNumber) => Task.FromResult(_employees.FirstOrDefault(e => e.DocumentNumber == documentNumber));
    public Task AddAsync(Employee employee)
    {
        employee.Uuid = Guid.NewGuid().ToString();
        _employees.Add(employee);
        return Task.CompletedTask;
    }
    public Task UpdateAsync(Employee employee)
    {
        var existing = _employees.FirstOrDefault(e => e.DocumentNumber == employee.DocumentNumber);
        if (existing != null)
        {
            _employees.Remove(existing);
            _employees.Add(employee);
        }
        return Task.CompletedTask;
    }
    public Task DeleteAsync(string documentNumber)
    {
        var existing = _employees.FirstOrDefault(e => e.DocumentNumber == documentNumber);
        if (existing != null) _employees.Remove(existing);
        return Task.CompletedTask;
    }
}

public class NewManagementServiceTests
{
    [Fact]
    public async Task AddProduct_ValidProduct_Succeeds()
    {
        // Arrange
        var repo = new FakeProductRepository();
        var service = new ProductService(repo);
        var product = new Product { Name = "Dog Food", SKU = "DF-01", Price = 20, StockQuantity = 10 };

        // Act
        var result = await service.AddAsync(product);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Uuid);
        var all = await repo.GetAllAsync();
        Assert.Single(all);
    }

    [Fact]
    public async Task AddEmployee_ValidEmployee_Succeeds()
    {
        // Arrange
        var repo = new FakeEmployeeRepository();
        var service = new EmployeeService(repo);
        var employee = new Employee { Name = "John Doe", DocumentNumber = "123", DocumentType = "CC", Role = "Vet", Phone = "555" };

        // Act
        var result = await service.AddAsync(employee);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Uuid);
        var all = await repo.GetAllAsync();
        Assert.Single(all);
    }
}
