using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IAppointmentService
{
    Task<IEnumerable<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment?> GetAppointmentByIdAsync(string uuid);
    Task<IEnumerable<Appointment>> GetAppointmentsByPetAsync(string petUuid);
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<Appointment> UpdateAppointmentAsync(string uuid, Appointment appointment);
    Task<bool> DeleteAppointmentAsync(string uuid);
}
