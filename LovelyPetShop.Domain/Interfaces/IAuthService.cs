using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public class AuthResult
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public User? User { get; set; }
    public string? ErrorMessage { get; set; }

    public static AuthResult Ok(string token, User user) => new() { Success = true, Token = token, User = user };
    public static AuthResult Fail(string error) => new() { Success = false, ErrorMessage = error };
}

public interface IAuthService
{
    Task<AuthResult> LoginAsync(string usernameOrEmail, string password);
    Task<AuthResult> RegisterCustomerAsync(string username, string email, string password, string fullName, string phone, string address);
    Task EnsureSeedUsersAsync();
}
