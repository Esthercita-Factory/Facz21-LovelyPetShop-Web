using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class Hospitalization
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("pet_uuid")]
    public string PetUuid { get; set; } = string.Empty;

    [JsonPropertyName("pet_name")]
    public string PetName { get; set; } = string.Empty;

    [JsonPropertyName("species")]
    public string Species { get; set; } = "Perro";

    [JsonPropertyName("owner_name")]
    public string OwnerName { get; set; } = string.Empty;

    [JsonPropertyName("owner_phone")]
    public string OwnerPhone { get; set; } = string.Empty;

    [JsonPropertyName("cage_number")]
    public string CageNumber { get; set; } = "C-01"; // Jaula / Canil

    [JsonPropertyName("admission_date")]
    public DateTime AdmissionDate { get; set; } = DateTime.Now;

    [JsonPropertyName("discharge_date")]
    public DateTime? DischargeDate { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty; // Motivo de internación

    [JsonPropertyName("status")]
    public string Status { get; set; } = "En Observación"; // En Observación, Post-Quirúrgico, Crítico, En Recuperación, Alta

    [JsonPropertyName("attending_vet")]
    public string AttendingVet { get; set; } = string.Empty;

    [JsonPropertyName("medication_plan")]
    public string MedicationPlan { get; set; } = string.Empty;

    [JsonPropertyName("diet_notes")]
    public string DietNotes { get; set; } = string.Empty;

    [JsonPropertyName("evolution_notes")]
    public string EvolutionNotes { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
