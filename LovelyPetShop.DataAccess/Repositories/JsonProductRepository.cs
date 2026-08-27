using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonProductRepository : IProductRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonProductRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "products.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath)) File.WriteAllText(_filePath, "[]");
    }

    private async Task<List<Product>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<Product>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<Product>>(stream, JsonOptions);
            return list ?? new List<Product>();
        }
        catch (JsonException) { return new List<Product>(); }
    }

    private async Task SaveDataAsync(List<Product> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<Product>> GetAllAsync() => await LoadDataAsync();

    public async Task<Product?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<Product?> GetBySkuAsync(string sku)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.SKU, sku, StringComparison.OrdinalIgnoreCase));
    }

    public async Task AddAsync(Product product)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(product.Uuid)) product.Uuid = Guid.NewGuid().ToString();
        items.Add(product);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(Product product)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, product.Uuid, StringComparison.OrdinalIgnoreCase) || 
                                         string.Equals(x.SKU, product.SKU, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = product;
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
