using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IMedicalRecordService
{
    Task<IEnumerable<MedicalRecord>> GetAllRecordsAsync();
    Task<MedicalRecord?> GetRecordByIdAsync(string uuid);
    Task<IEnumerable<MedicalRecord>> GetRecordsByPetAsync(string petUuid);
    Task<MedicalRecord> AddRecordAsync(MedicalRecord record);
    Task<MedicalRecord> UpdateRecordAsync(string uuid, MedicalRecord record);
    Task<bool> DeleteRecordAsync(string uuid);
}
