using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Veterinario = "Veterinario";
    public const string Recepcion = "Recepcion";
    public const string Cliente = "Cliente";

    public static readonly string[] AllRoles = [Admin, Veterinario, Recepcion, Cliente];
}

public class User
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = UserRoles.Cliente;

    [JsonPropertyName("owner_id")]
    public string? OwnerId { get; set; } // Vinculado a Owner si el rol es Cliente

    [JsonPropertyName("employee_id")]
    public string? EmployeeId { get; set; } // Vinculado a Employee si el rol es Veterinario/Recepcion/Admin

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; } = true;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User() { }

    public User(string username, string email, string passwordHash, string fullName, string role, string? ownerId = null, string? employeeId = null)
    {
        Uuid = Guid.NewGuid().ToString();
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        FullName = fullName;
        Role = role;
        OwnerId = ownerId;
        EmployeeId = employeeId;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }
}
