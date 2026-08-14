using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class MedicalRecordService : IMedicalRecordService
{
    private readonly IMedicalRecordRepository _repository;

    public MedicalRecordService(IMedicalRecordRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MedicalRecord>> GetAllRecordsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<MedicalRecord?> GetRecordByIdAsync(string uuid)
    {
        return await _repository.GetByUuidAsync(uuid);
    }

    public async Task<IEnumerable<MedicalRecord>> GetRecordsByPetAsync(string petUuid)
    {
        return await _repository.GetByPetUuidAsync(petUuid);
    }

    public async Task<MedicalRecord> AddRecordAsync(MedicalRecord record)
    {
        if (string.IsNullOrWhiteSpace(record.PetUuid))
            throw new ArgumentException("El UUID de la mascota es obligatorio.");

        await _repository.AddAsync(record);
        return record;
    }

    public async Task<MedicalRecord> UpdateRecordAsync(string uuid, MedicalRecord record)
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException("Historial médico no encontrado.");

        record.Uuid = uuid;
        await _repository.UpdateAsync(record);
        return record;
    }

    public async Task<bool> DeleteRecordAsync(string uuid)
    {
        return await _repository.DeleteByUuidAsync(uuid);
    }
}
