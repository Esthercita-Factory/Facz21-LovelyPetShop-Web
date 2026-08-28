using System.Text.Json;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.DataAccess.Repositories;

public class JsonHospitalizationRepository : IHospitalizationRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonHospitalizationRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "hospitalizations.json");
        EnsureFileExists();
    }

    private void EnsureFileExists()
    {
        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        if (!File.Exists(_filePath))
        {
            var seed = new List<Hospitalization>
            {
                new Hospitalization
                {
                    Uuid = Guid.NewGuid().ToString(),
                    PetUuid = "pet-1",
                    PetName = "Max",
                    Species = "Perro",
                    OwnerName = "Juan Pérez",
                    OwnerPhone = "3001234567",
                    CageNumber = "C-01",
                    AdmissionDate = DateTime.Now.AddDays(-1),
                    Reason = "Recuperación post-operatoria por esterilización",
                    Status = "Post-Quirúrgico",
                    AttendingVet = "Dr. Carlos Gómez",
                    MedicationPlan = "Meloxicam 0.2mg cada 24h, Cefalexina 250mg cada 12h",
                    DietNotes = "Dieta blanda gastroentérica húmeda",
                    EvolutionNotes = "Paciente estable, herida quirúrgica limpia sin sangrado."
                },
                new Hospitalization
                {
                    Uuid = Guid.NewGuid().ToString(),
                    PetUuid = "pet-2",
                    PetName = "Luna",
                    Species = "Gato",
                    OwnerName = "María Rodríguez",
                    OwnerPhone = "3109876543",
                    CageNumber = "F-02",
                    AdmissionDate = DateTime.Now.AddHours(-12),
                    Reason = "Cuadro de deshidratación moderada y gastroenteritis",
                    Status = "En Observación",
                    AttendingVet = "Dra. Laura Morales",
                    MedicationPlan = "Fluidoterapia Hartman 15ml/h, Metoclopramida 0.5mg/kg",
                    DietNotes = "Ayuno por 6 horas más, luego papilla de recuperación",
                    EvolutionNotes = "Ha tolerado bien los líquidos, micción positiva."
                }
            };
            File.WriteAllText(_filePath, JsonSerializer.Serialize(seed, JsonOptions));
        }
    }

    private async Task<List<Hospitalization>> LoadDataAsync()
    {
        if (!File.Exists(_filePath)) return new List<Hospitalization>();
        try
        {
            await using var stream = File.OpenRead(_filePath);
            var list = await JsonSerializer.DeserializeAsync<List<Hospitalization>>(stream, JsonOptions);
            return list ?? new List<Hospitalization>();
        }
        catch (JsonException) { return new List<Hospitalization>(); }
    }

    private async Task SaveDataAsync(List<Hospitalization> items)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }

    public async Task<IEnumerable<Hospitalization>> GetAllAsync() => await LoadDataAsync();

    public async Task<Hospitalization?> GetByUuidAsync(string uuid)
    {
        var items = await LoadDataAsync();
        return items.FirstOrDefault(x => string.Equals(x.Uuid, uuid, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<Hospitalization>> GetActiveAsync()
    {
        var items = await LoadDataAsync();
        return items.Where(x => !string.Equals(x.Status, "Alta", StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task AddAsync(Hospitalization hospitalization)
    {
        var items = await LoadDataAsync();
        if (string.IsNullOrWhiteSpace(hospitalization.Uuid)) hospitalization.Uuid = Guid.NewGuid().ToString();
        items.Add(hospitalization);
        await SaveDataAsync(items);
    }

    public async Task UpdateAsync(Hospitalization hospitalization)
    {
        var items = await LoadDataAsync();
        var index = items.FindIndex(x => string.Equals(x.Uuid, hospitalization.Uuid, StringComparison.OrdinalIgnoreCase));
        if (index >= 0)
        {
            items[index] = hospitalization;
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
