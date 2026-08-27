using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<Appointment?> GetByUuidAsync(string uuid);
    Task<IEnumerable<Appointment>> GetByPetUuidAsync(string petUuid);
    Task AddAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
    Task<bool> DeleteByUuidAsync(string uuid);
}
