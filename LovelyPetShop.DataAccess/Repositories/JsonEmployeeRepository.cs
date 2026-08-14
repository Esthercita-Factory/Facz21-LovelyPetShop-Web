using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonEmployeeRepository : IEmployeeRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonEmployeeRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "employees.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath)) File.WriteAllText(_filePath, "[]");
    }

    private async Task<List<Employee>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<Employee>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<Employee>>(stream, JsonOptions);
            return list ?? new List<Employee>();
        }
        catch (JsonException) { return new List<Employee>(); }
    }

    private async Task SaveDataAsync(List<Employee> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync() => await LoadDataAsync();

    public async Task<Employee?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task AddAsync(Employee employee)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(employee.Uuid)) employee.Uuid = Guid.NewGuid().ToString();
        items.Add(employee);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(Employee employee)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, employee.Uuid, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = employee;
            await SaveDataAsync(items);
        }
    }

    public async Task<bool> DeleteByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        var count = items.RemoveAll(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
        if (count > 0)
        {
            await SaveDataAsync(items);
            return true;
        }
        return false;
    }
}
