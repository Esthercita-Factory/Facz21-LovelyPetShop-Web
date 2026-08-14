using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class Employee
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty; // Veterinario, Peluquero, etc.

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("schedule")]
    public string Schedule { get; set; } = string.Empty; // Ej: L-V 8am-5pm

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Employee() { }

    public Employee(string name, string role, string phone, string email, string schedule)
    {
        Uuid = Guid.NewGuid().ToString();
        Name = name;
        Role = role;
        Phone = phone;
        Email = email;
        Schedule = schedule;
        CreatedAt = DateTime.Now;
    }
}
