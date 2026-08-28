using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class HospitalizationService : IHospitalizationService
{
    private readonly IHospitalizationRepository _repository;
    private readonly IAuditService _auditService;

    public HospitalizationService(IHospitalizationRepository repository, IAuditService auditService)
    {
        _repository = repository;
        _auditService = auditService;
    }

    public async Task<IEnumerable<Hospitalization>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Hospitalization?> GetByUuidAsync(string uuid) => await _repository.GetByUuidAsync(uuid);

    public async Task<IEnumerable<Hospitalization>> GetActiveAsync() => await _repository.GetActiveAsync();

    public async Task<Hospitalization> CreateAsync(Hospitalization hospitalization, string user = "Admin")
    {
        if (string.IsNullOrWhiteSpace(hospitalization.PetName))
            throw new ArgumentException("El nombre del paciente hospitalizado es obligatorio.");

        if (string.IsNullOrWhiteSpace(hospitalization.CageNumber))
            hospitalization.CageNumber = "C-01";

        hospitalization.AdmissionDate = hospitalization.AdmissionDate == default ? DateTime.Now : hospitalization.AdmissionDate;
        await _repository.AddAsync(hospitalization);

        await _auditService.LogActionAsync(
            user,
            "Staff",
            "CREAR",
            "Hospitalización",
            $"Admisión hospitalaria para {hospitalization.PetName} ({hospitalization.Species}) en jaula {hospitalization.CageNumber}. Motivo: {hospitalization.Reason}"
        );

        return hospitalization;
    }

    public async Task<Hospitalization> UpdateAsync(string uuid, Hospitalization hospitalization, string user = "Admin")
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null) throw new KeyNotFoundException("Hospitalización no encontrada.");

        hospitalization.Uuid = uuid;
        if (hospitalization.Status == "Alta" && !hospitalization.DischargeDate.HasValue)
        {
            hospitalization.DischargeDate = DateTime.Now;
        }

        await _repository.UpdateAsync(hospitalization);

        await _auditService.LogActionAsync(
            user,
            "Staff",
            "ACTUALIZAR",
            "Hospitalización",
            $"Actualización de estado '{hospitalization.Status}' para paciente internado {hospitalization.PetName} ({hospitalization.CageNumber})."
        );

        return hospitalization;
    }

    public async Task<bool> DeleteAsync(string uuid, string user = "Admin")
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        var success = await _repository.DeleteByUuidAsync(uuid);
        if (success && existing != null)
        {
            await _auditService.LogActionAsync(
                user,
                "Staff",
                "ELIMINAR",
                "Hospitalización",
                $"Eliminado registro de internación para {existing.PetName} ({existing.CageNumber})."
            );
        }
        return success;
    }
}
