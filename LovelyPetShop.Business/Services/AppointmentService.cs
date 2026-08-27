using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;

    public AppointmentService(IAppointmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Appointment>> GetAllAppointmentsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(string uuid)
    {
        return await _repository.GetByUuidAsync(uuid);
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByPetAsync(string petUuid)
    {
        return await _repository.GetByPetUuidAsync(petUuid);
    }

    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        if (appointment.ScheduledDate < DateTime.Now)
            throw new ArgumentException("La cita no puede ser programada en el pasado.");

        await _repository.AddAsync(appointment);
        return appointment;
    }

    public async Task<Appointment> UpdateAppointmentAsync(string uuid, Appointment appointment)
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException("Cita no encontrada.");

        appointment.Uuid = uuid;
        await _repository.UpdateAsync(appointment);
        return appointment;
    }

    public async Task<bool> DeleteAppointmentAsync(string uuid)
    {
        return await _repository.DeleteByUuidAsync(uuid);
    }
}
