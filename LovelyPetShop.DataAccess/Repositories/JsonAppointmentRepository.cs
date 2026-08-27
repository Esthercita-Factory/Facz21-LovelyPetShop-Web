using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonAppointmentRepository : IAppointmentRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonAppointmentRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appointments.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath)) File.WriteAllText(_filePath, "[]");
    }

    private async Task<List<Appointment>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<Appointment>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<Appointment>>(stream, JsonOptions);
            return list ?? new List<Appointment>();
        }
        catch (JsonException) { return new List<Appointment>(); }
    }

    private async Task SaveDataAsync(List<Appointment> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<Appointment>> GetAllAsync() => await LoadDataAsync();

    public async Task<Appointment?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<Appointment>> GetByPetUuidAsync(string petUuid)
    {
        var items = await LoadDataAsync();
        return items.Where(x => string.Equals(x.PetUuid, petUuid, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task AddAsync(Appointment appointment)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(appointment.Uuid)) appointment.Uuid = Guid.NewGuid().ToString();
        items.Add(appointment);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(Appointment appointment)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, appointment.Uuid, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = appointment;
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
