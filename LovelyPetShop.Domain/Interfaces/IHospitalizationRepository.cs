using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IHospitalizationRepository
{
    Task<IEnumerable<Hospitalization>> GetAllAsync();
    Task<Hospitalization?> GetByUuidAsync(string uuid);
    Task<IEnumerable<Hospitalization>> GetActiveAsync();
    Task AddAsync(Hospitalization hospitalization);
    Task UpdateAsync(Hospitalization hospitalization);
    Task<bool> DeleteByUuidAsync(string uuid);
}
