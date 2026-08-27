using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonMedicalRecordRepository : IMedicalRecordRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonMedicalRecordRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "medical_records.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath)) File.WriteAllText(_filePath, "[]");
    }

    private async Task<List<MedicalRecord>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<MedicalRecord>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<MedicalRecord>>(stream, JsonOptions);
            return list ?? new List<MedicalRecord>();
        }
        catch (JsonException) { return new List<MedicalRecord>(); }
    }

    private async Task SaveDataAsync(List<MedicalRecord> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<MedicalRecord>> GetAllAsync() => await LoadDataAsync();

    public async Task<MedicalRecord?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<MedicalRecord>> GetByPetUuidAsync(string petUuid)
    {
        var items = await LoadDataAsync();
        return items.Where(x => string.Equals(x.PetUuid, petUuid, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task AddAsync(MedicalRecord record)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(record.Uuid)) record.Uuid = Guid.NewGuid().ToString();
        items.Add(record);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(MedicalRecord record)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, record.Uuid, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = record;
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
