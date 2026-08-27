using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class MedicalRecord
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("pet_uuid")]
    public string PetUuid { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    public DateTime Date { get; set; } = DateTime.Now;

    [JsonPropertyName("weight")]
    public double Weight { get; set; }

    [JsonPropertyName("diagnosis")]
    public string Diagnosis { get; set; } = string.Empty;

    [JsonPropertyName("treatment")]
    public string Treatment { get; set; } = string.Empty;

    [JsonPropertyName("next_vaccine_date")]
    public DateTime? NextVaccineDate { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public MedicalRecord() { }

    public MedicalRecord(string petUuid, double weight, string diagnosis, string treatment, DateTime? nextVaccineDate = null)
    {
        Uuid = Guid.NewGuid().ToString();
        PetUuid = petUuid;
        Weight = weight;
        Diagnosis = diagnosis;
        Treatment = treatment;
        NextVaccineDate = nextVaccineDate;
        Date = DateTime.Now;
        CreatedAt = DateTime.Now;
    }
}
