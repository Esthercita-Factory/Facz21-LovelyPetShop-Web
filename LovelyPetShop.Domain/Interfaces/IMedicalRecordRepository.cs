using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IMedicalRecordRepository
{
    Task<IEnumerable<MedicalRecord>> GetAllAsync();
    Task<MedicalRecord?> GetByUuidAsync(string uuid);
    Task<IEnumerable<MedicalRecord>> GetByPetUuidAsync(string petUuid);
    Task AddAsync(MedicalRecord record);
    Task UpdateAsync(MedicalRecord record);
    Task<bool> DeleteByUuidAsync(string uuid);
}
