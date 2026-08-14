using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class Appointment
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("pet_uuid")]
    public string PetUuid { get; set; } = string.Empty;

    [JsonPropertyName("owner_uuid")]
    public string OwnerUuid { get; set; } = string.Empty;

    [JsonPropertyName("scheduled_date")]
    public DateTime ScheduledDate { get; set; }

    [JsonPropertyName("service_type")]
    public string ServiceType { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Pendiente"; // Pendiente, Completado, Cancelado

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Appointment() { }

    public Appointment(string petUuid, string ownerUuid, DateTime scheduledDate, string serviceType, string notes)
    {
        Uuid = Guid.NewGuid().ToString();
        PetUuid = petUuid;
        OwnerUuid = ownerUuid;
        ScheduledDate = scheduledDate;
        ServiceType = serviceType;
        Notes = notes;
        Status = "Pendiente";
        CreatedAt = DateTime.Now;
    }
}
