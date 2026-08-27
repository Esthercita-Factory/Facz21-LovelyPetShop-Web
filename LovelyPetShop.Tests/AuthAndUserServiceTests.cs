using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LovelyPetShop.Business.Security;
using LovelyPetShop.Business.Services;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LovelyPetShop.Tests;

public class FakeUserRepository : IUserRepository
{
    private readonly List<User> _users = new();

    public Task<IEnumerable<User>> GetAllAsync() => Task.FromResult<IEnumerable<User>>(_users);
    public Task<User?> GetByUuidAsync(string uuid) => Task.FromResult(_users.FirstOrDefault(u => u.Uuid == uuid));
    public Task<User?> GetByUsernameAsync(string username) => Task.FromResult(_users.FirstOrDefault(u => u.Username.Equals(username, System.StringComparison.OrdinalIgnoreCase)));
    public Task<User?> GetByEmailAsync(string email) => Task.FromResult(_users.FirstOrDefault(u => u.Email.Equals(email, System.StringComparison.OrdinalIgnoreCase)));
    public Task AddAsync(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Uuid)) user.Uuid = System.Guid.NewGuid().ToString();
        _users.Add(user);
        return Task.CompletedTask;
    }
    public Task UpdateAsync(User user)
    {
        var index = _users.FindIndex(u => u.Uuid == user.Uuid);
        if (index >= 0) _users[index] = user;
        return Task.CompletedTask;
    }
    public Task<bool> DeleteByUuidAsync(string uuid)
    {
        var count = _users.RemoveAll(u => u.Uuid == uuid);
        return Task.FromResult(count > 0);
    }
}

public class AuthAndUserServiceTests
{
    [Fact]
    public async Task UserService_CreateAndValidateUser_Succeeds()
    {
        // Arrange
        var userRepo = new FakeUserRepository();
        var userService = new UserService(userRepo);

        var newUser = new User
        {
            Username = "veterinario1",
            Email = "vet1@lovelypet.com",
            FullName = "Dr. Carlos Veterinario",
            Role = UserRoles.Veterinario
        };

        // Act
        var created = await userService.CreateUserAsync(newUser, "SecurePass123!");

        // Assert
        Assert.NotNull(created);
        Assert.NotEmpty(created.PasswordHash);
        Assert.True(PasswordHasher.VerifyPassword("SecurePass123!", created.PasswordHash));
        Assert.False(PasswordHasher.VerifyPassword("WrongPass", created.PasswordHash));
    }

    [Fact]
    public async Task AuthService_LoginWithCorrectPassword_ReturnsValidToken()
    {
        // Arrange
        var userRepo = new FakeUserRepository();
        var ownerRepo = new FakeOwnerRepository();
        var empRepo = new FakeEmployeeRepository();

        var configValues = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "LovelyPetShopSuperSecretTestKey2026!#ForSecurity*&SafeTokenGenerator"},
            {"Jwt:Issuer", "LovelyPetShopTest"},
            {"Jwt:Audience", "LovelyPetShopUsersTest"}
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();

        var authService = new AuthService(userRepo, ownerRepo, empRepo, config);

        var user = new User
        {
            Username = "admin_test",
            Email = "admin@test.com",
            FullName = "Super Admin",
            Role = UserRoles.Admin,
            PasswordHash = PasswordHasher.HashPassword("AdminPass2026!"),
            IsActive = true
        };
        await userRepo.AddAsync(user);

        // Act
        var result = await authService.LoginAsync("admin_test", "AdminPass2026!");

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Token);
        Assert.Equal(UserRoles.Admin, result.User?.Role);
    }

    [Fact]
    public async Task AuthService_RegisterCustomer_CreatesOwnerAndUserWithCustomerRole()
    {
        // Arrange
        var userRepo = new FakeUserRepository();
        var ownerRepo = new FakeOwnerRepository();
        var empRepo = new FakeEmployeeRepository();

        var configValues = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "LovelyPetShopSuperSecretTestKey2026!#ForSecurity*&SafeTokenGenerator"},
            {"Jwt:Issuer", "LovelyPetShopTest"},
            {"Jwt:Audience", "LovelyPetShopUsersTest"}
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();

        var authService = new AuthService(userRepo, ownerRepo, empRepo, config);

        // Act
        var result = await authService.RegisterCustomerAsync(
            "laurag",
            "laura@gmail.com",
            "CustomerPass123!",
            "Laura Gómez",
            "3001234567",
            "Calle 50 # 10-20"
        );

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Token);
        Assert.Equal(UserRoles.Cliente, result.User?.Role);
        Assert.NotNull(result.User?.OwnerId);

        var createdOwner = await ownerRepo.GetByUuidAsync(result.User!.OwnerId!);
        Assert.NotNull(createdOwner);
        Assert.Equal("Laura Gómez", createdOwner.Name);
    }
}
