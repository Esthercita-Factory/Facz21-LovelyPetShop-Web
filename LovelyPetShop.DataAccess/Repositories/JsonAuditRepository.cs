using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonAuditRepository : IAuditRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonAuditRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "audit_logs.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath))
        {
            var seed = new List<AuditLog>
            {
                new AuditLog
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.Now.AddHours(-2),
                    UserName = "admin",
                    UserRole = "Admin",
                    Action = "INICIO_SESION",
                    Module = "Seguridad",
                    Description = "Ingreso exitoso al panel administrativo de la clínica."
                },
                new AuditLog
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.Now.AddHours(-1),
                    UserName = "vet",
                    UserRole = "Veterinario",
                    Action = "ACTUALIZAR",
                    Module = "Hospitalización",
                    Description = "Actualización de notas médicas y plan de medicación para paciente Luna (C-02)."
                }
            };
            File.WriteAllText(_filePath, JsonSerializer.Serialize(seed, JsonOptions));
        }
    }

    private async Task<List<AuditLog>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<AuditLog>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<AuditLog>>(stream, JsonOptions);
            return list ?? new List<AuditLog>();
        }
        catch (JsonException) { return new List<AuditLog>(); }
    }

    private async Task SaveDataAsync(List<AuditLog> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync()
    {
        var logs = await LoadDataAsync();
        return logs.OrderByDescending(x => x.Timestamp).ToList();
    }

    public async Task AddAsync(AuditLog log)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(log.Uuid)) log.Uuid = Guid.NewGuid().ToString();
        items.Insert(0, log);
        // Retain last 500 logs
        if (items.Count > 500) items = items.Take(500).ToList();
        await SaveDataAsync(items);
    }
}
