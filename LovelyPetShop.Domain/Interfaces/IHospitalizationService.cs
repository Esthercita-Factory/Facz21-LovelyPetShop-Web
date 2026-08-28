using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IHospitalizationService
{
    Task<IEnumerable<Hospitalization>> GetAllAsync();
    Task<Hospitalization?> GetByUuidAsync(string uuid);
    Task<IEnumerable<Hospitalization>> GetActiveAsync();
    Task<Hospitalization> CreateAsync(Hospitalization hospitalization, string user = "Admin");
    Task<Hospitalization> UpdateAsync(string uuid, Hospitalization hospitalization, string user = "Admin");
    Task<bool> DeleteAsync(string uuid, string user = "Admin");
}
