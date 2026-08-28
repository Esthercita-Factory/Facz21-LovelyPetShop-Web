using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using LovelyPetShop.Business.Security;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LovelyPetShop.Business.Services;

public class AuthService : IAuthService
{
    private static readonly Regex EmailRegex = new(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.Compiled);

    private readonly IUserRepository _userRepository;
    private readonly IOwnerRepository _ownerRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IOwnerRepository ownerRepository,
        IEmployeeRepository employeeRepository,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _ownerRepository = ownerRepository;
        _employeeRepository = employeeRepository;
        _configuration = configuration;
    }

    public async Task<AuthResult> LoginAsync(string usernameOrEmail, string password)
    {
        if (string.IsNullOrWhiteSpace(usernameOrEmail) || string.IsNullOrWhiteSpace(password))
            return AuthResult.Fail("Nombre de usuario/correo y contraseña son requeridos.");

        var user = await _userRepository.GetByUsernameAsync(usernameOrEmail.Trim())
                   ?? await _userRepository.GetByEmailAsync(usernameOrEmail.Trim());

        if (user == null)
            return AuthResult.Fail("Credenciales inválidas.");

        if (!user.IsActive)
            return AuthResult.Fail("La cuenta de usuario se encuentra desactivada.");

        if (!PasswordHasher.VerifyPassword(password, user.PasswordHash))
            return AuthResult.Fail("Credenciales inválidas.");

        var token = GenerateJwtToken(user);
        return AuthResult.Ok(token, user);
    }

    public async Task<AuthResult> RegisterCustomerAsync(
        string username,
        string email,
        string password,
        string fullName,
        string phone,
        string address)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return AuthResult.Fail("Usuario, correo y contraseña son obligatorios.");

        username = username.Trim();
        email = email.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(email))
            return AuthResult.Fail("El correo electrónico ingresado no tiene un formato válido o real (ej: usuario@dominio.com).");

        if (password.Length < 6)
            return AuthResult.Fail("La contraseña debe tener al menos 6 caracteres.");

        if (await _userRepository.GetByUsernameAsync(username) != null)
            return AuthResult.Fail("El nombre de usuario ya está en uso.");

        if (await _userRepository.GetByEmailAsync(email) != null)
            return AuthResult.Fail("El correo electrónico ya está registrado.");

        // Check if an Owner with this email already exists or create a new Owner
        var existingOwners = await _ownerRepository.GetAllAsync();
        var existingOwner = existingOwners.FirstOrDefault(o => string.Equals(o.Email, email, StringComparison.OrdinalIgnoreCase));

        string ownerId;
        if (existingOwner != null)
        {
            ownerId = existingOwner.Uuid;
        }
        else
        {
            var newOwner = new Owner
            {
                Uuid = Guid.NewGuid().ToString(),
                Name = fullName.Trim(),
                Email = email,
                Phone = phone?.Trim() ?? string.Empty,
                Address = address?.Trim() ?? string.Empty,
                DocumentType = "CC",
                DocumentNumber = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
                CreatedAt = DateTime.UtcNow
            };
            await _ownerRepository.AddAsync(newOwner);
            ownerId = newOwner.Uuid;
        }

        var newUser = new User
        {
            Uuid = Guid.NewGuid().ToString(),
            Username = username,
            Email = email,
            FullName = fullName.Trim(),
            Role = UserRoles.Cliente,
            OwnerId = ownerId,
            PasswordHash = PasswordHasher.HashPassword(password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(newUser);

        var token = GenerateJwtToken(newUser);
        return AuthResult.Ok(token, newUser);
    }

    public async Task EnsureSeedUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        if (users.Any()) return;

        // Create Seed Employees if needed
        var employees = (await _employeeRepository.GetAllAsync()).ToList();
        var vetEmp = employees.FirstOrDefault(e => e.Role.Contains("Veterinario", StringComparison.OrdinalIgnoreCase));
        if (vetEmp == null)
        {
            vetEmp = new Employee("Dra. Valeria Ramos", "Veterinario", "3123456789", "valeria.vet@lovelypet.com", "L-V 8am-5pm");
            await _employeeRepository.AddAsync(vetEmp);
        }

        var recEmp = employees.FirstOrDefault(e => e.Role.Contains("Recepcion", StringComparison.OrdinalIgnoreCase));
        if (recEmp == null)
        {
            recEmp = new Employee("Carlos Mendoza", "Recepcion", "3159876543", "recepcion@lovelypet.com", "L-S 7am-4pm");
            await _employeeRepository.AddAsync(recEmp);
        }

        // Link with first existing owner if available
        var owners = (await _ownerRepository.GetAllAsync()).ToList();
        var firstOwner = owners.FirstOrDefault();

        // 1. Admin
        var admin = new User
        {
            Uuid = Guid.NewGuid().ToString(),
            Username = "admin",
            Email = "admin@lovelypet.com",
            FullName = "Administrador del Sistema",
            Role = UserRoles.Admin,
            PasswordHash = PasswordHasher.HashPassword("Admin123!"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.AddAsync(admin);

        // 2. Veterinario
        var vet = new User
        {
            Uuid = Guid.NewGuid().ToString(),
            Username = "vet",
            Email = "valeria.vet@lovelypet.com",
            FullName = "Dra. Valeria Ramos",
            Role = UserRoles.Veterinario,
            EmployeeId = vetEmp.Uuid,
            PasswordHash = PasswordHasher.HashPassword("Vet123!"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.AddAsync(vet);

        // 3. Recepcion
        var recepcion = new User
        {
            Uuid = Guid.NewGuid().ToString(),
            Username = "recepcion",
            Email = "recepcion@lovelypet.com",
            FullName = "Carlos Mendoza (Recepción)",
            Role = UserRoles.Recepcion,
            EmployeeId = recEmp.Uuid,
            PasswordHash = PasswordHasher.HashPassword("Recepcion123!"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.AddAsync(recepcion);

        // 4. Cliente Demo
        var cliente = new User
        {
            Uuid = Guid.NewGuid().ToString(),
            Username = "cliente",
            Email = firstOwner?.Email ?? "cliente@lovelypet.com",
            FullName = firstOwner?.Name ?? "Cliente Demo",
            Role = UserRoles.Cliente,
            OwnerId = firstOwner?.Uuid,
            PasswordHash = PasswordHasher.HashPassword("Cliente123!"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.AddAsync(cliente);
    }

    private string GenerateJwtToken(User user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "LovelyPetShopSuperSecretKey2026!#ForSecurity*&SafeTokenGenerator";
        var issuer = _configuration["Jwt:Issuer"] ?? "LovelyPetShop";
        var audience = _configuration["Jwt:Audience"] ?? "LovelyPetShopUsers";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Uuid),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, user.Role),
            new("full_name", user.FullName ?? string.Empty)
        };

        if (!string.IsNullOrEmpty(user.OwnerId))
        {
            claims.Add(new Claim("owner_id", user.OwnerId));
        }

        if (!string.IsNullOrEmpty(user.EmployeeId))
        {
            claims.Add(new Claim("employee_id", user.EmployeeId));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
