using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class AuditLog
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.Now;

    [JsonPropertyName("user_name")]
    public string UserName { get; set; } = "Sistema";

    [JsonPropertyName("user_role")]
    public string UserRole { get; set; } = "Admin";

    [JsonPropertyName("action")]
    public string Action { get; set; } = "CREAR"; // CREAR, ACTUALIZAR, ELIMINAR, ACCESO

    [JsonPropertyName("module")]
    public string Module { get; set; } = "General"; // Pacientes, Citas, Farmacia/Inventario, Hospitalización, Personal, Historias Clínicas, Autenticación

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("details")]
    public string Details { get; set; } = string.Empty;
}
