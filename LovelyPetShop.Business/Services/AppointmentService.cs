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
        ValidateAppointmentDateTime(appointment.ScheduledDate, isNewAppointment: true);

        // Check for double booking conflicts (same pet or exact overlapping slot)
        var allAppointments = await _repository.GetAllAsync();
        var conflicting = allAppointments.FirstOrDefault(a => 
            a.Status != "Cancelada" &&
            (
                (a.PetUuid == appointment.PetUuid && Math.Abs((a.ScheduledDate - appointment.ScheduledDate).TotalMinutes) < 45) ||
                (Math.Abs((a.ScheduledDate - appointment.ScheduledDate).TotalMinutes) < 20)
            )
        );

        if (conflicting != null)
        {
            if (conflicting.PetUuid == appointment.PetUuid)
            {
                throw new ArgumentException("La mascota ya tiene una cita activa programada en un horario similar.");
            }
            throw new ArgumentException("El horario seleccionado ya se encuentra reservado. Por favor elija otro turno disponible.");
        }

        await _repository.AddAsync(appointment);
        return appointment;
    }

    public async Task<Appointment> UpdateAppointmentAsync(string uuid, Appointment appointment)
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException("Cita no encontrada.");

        // If the scheduled date was modified, validate it
        if (Math.Abs((existing.ScheduledDate - appointment.ScheduledDate).TotalMinutes) > 5)
        {
            ValidateAppointmentDateTime(appointment.ScheduledDate, isNewAppointment: false);
        }

        appointment.Uuid = uuid;
        await _repository.UpdateAsync(appointment);
        return appointment;
    }

    public async Task<bool> DeleteAppointmentAsync(string uuid)
    {
        return await _repository.DeleteByUuidAsync(uuid);
    }

    private static void ValidateAppointmentDateTime(DateTime scheduledDate, bool isNewAppointment = true)
    {
        var localDate = scheduledDate.Kind == DateTimeKind.Utc ? scheduledDate.ToLocalTime() : scheduledDate;

        if (isNewAppointment && localDate < DateTime.Now.AddMinutes(-10))
        {
            throw new ArgumentException("Solo se pueden agendar citas para fechas y horas actuales o futuras.");
        }

        var hour = localDate.Hour;
        var dayOfWeek = localDate.DayOfWeek;

        if (dayOfWeek == DayOfWeek.Sunday)
        {
            if (hour < 8 || hour >= 14)
            {
                throw new ArgumentException("El horario de atención para los domingos es de 8:00 AM a 2:00 PM.");
            }
        }
        else
        {
            if (hour < 8 || hour >= 19)
            {
                throw new ArgumentException("El horario de atención es de 8:00 AM a 7:00 PM (Lunes a Sábado).");
            }
        }
    }
}
