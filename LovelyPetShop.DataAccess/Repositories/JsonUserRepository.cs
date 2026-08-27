using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonUserRepository : IUserRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonUserRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "users.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath)) File.WriteAllText(_filePath, "[]");
    }

    private async Task<List<User>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<User>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<User>>(stream, JsonOptions);
            return list ?? new List<User>();
        }
        catch (JsonException) { return new List<User>(); }
    }

    private async Task SaveDataAsync(List<User> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<User>> GetAllAsync() => await LoadDataAsync();

    public async Task<User?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase));
    }

    public async Task AddAsync(User user)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(user.Uuid)) user.Uuid = Guid.NewGuid().ToString();
        items.Add(user);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(User user)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, user.Uuid, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = user;
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
