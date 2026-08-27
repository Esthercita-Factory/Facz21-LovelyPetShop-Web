using LovelyPetShop.Business.Security;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _userRepository.GetAllAsync();
    }

    public async Task<User?> GetUserByIdAsync(string uuid)
    {
        return await _userRepository.GetByUuidAsync(uuid);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _userRepository.GetByUsernameAsync(username);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userRepository.GetByEmailAsync(email);
    }

    public async Task<User> CreateUserAsync(User user, string plainPassword)
    {
        if (string.IsNullOrWhiteSpace(user.Username))
            throw new ArgumentException("El nombre de usuario es obligatorio.");

        var existingUser = await _userRepository.GetByUsernameAsync(user.Username);
        if (existingUser != null)
            throw new InvalidOperationException("El nombre de usuario ya existe.");

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var existingEmail = await _userRepository.GetByEmailAsync(user.Email);
            if (existingEmail != null)
                throw new InvalidOperationException("El correo electrónico ya está registrado.");
        }

        user.PasswordHash = PasswordHasher.HashPassword(plainPassword);
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;

        await _userRepository.AddAsync(user);
        return user;
    }

    public async Task<User> UpdateUserAsync(string uuid, User user, string? newPassword = null)
    {
        var existing = await _userRepository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException($"Usuario con ID {uuid} no encontrado.");

        existing.FullName = user.FullName;
        existing.Email = user.Email;
        existing.Role = user.Role;
        existing.OwnerId = user.OwnerId;
        existing.EmployeeId = user.EmployeeId;
        existing.IsActive = user.IsActive;

        if (!string.IsNullOrWhiteSpace(newPassword))
        {
            existing.PasswordHash = PasswordHasher.HashPassword(newPassword);
        }

        await _userRepository.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteUserAsync(string uuid)
    {
        return await _userRepository.DeleteByUuidAsync(uuid);
    }
}
