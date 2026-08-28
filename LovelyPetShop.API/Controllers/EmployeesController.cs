using System.Text.Json.Serialization;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

public class CreateEmployeeRequest
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Veterinario";
    public string Specialty { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Schedule { get; set; } = "L-V 8am-5pm";
    public bool IsActive { get; set; } = true;
    
    // Optional login credentials
    public string? Username { get; set; }
    public string? Password { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;
    private readonly IUserRepository _userRepository;
    private readonly IAuditService _auditService;

    public EmployeesController(
        IEmployeeService service, 
        IUserRepository userRepository, 
        IAuditService auditService)
    {
        _service = service;
        _userRepository = userRepository;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllEmployeesAsync();
        return Ok(result);
    }

    [HttpGet("{idOrEmail}")]
    public async Task<IActionResult> Get(string idOrEmail)
    {
        var result = await _service.GetEmployeeByIdAsync(idOrEmail);
        if (result == null)
        {
            var all = await _service.GetAllEmployeesAsync();
            result = all.FirstOrDefault(e => string.Equals(e.Email, idOrEmail, StringComparison.OrdinalIgnoreCase));
        }
        if (result == null) return NotFound(new { message = "Empleado no encontrado." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest req)
    {
        try
        {
            var employee = new Employee
            {
                Name = req.Name,
                Role = req.Role,
                Specialty = req.Specialty,
                Phone = req.Phone,
                Email = req.Email,
                Schedule = req.Schedule,
                IsActive = req.IsActive
            };

            var created = await _service.CreateEmployeeAsync(employee);

            // If username and password provided, create User account
            if (!string.IsNullOrWhiteSpace(req.Username) && !string.IsNullOrWhiteSpace(req.Password))
            {
                var role = req.Role.Contains("Veterinario", StringComparison.OrdinalIgnoreCase) || req.Role.Contains("Cirujan", StringComparison.OrdinalIgnoreCase)
                    ? "Veterinario"
                    : req.Role.Contains("Recepci", StringComparison.OrdinalIgnoreCase)
                        ? "Recepcion"
                        : "Admin";

                var user = new User(req.Username.Trim(), req.Password, role, req.Name, req.Email);
                await _userRepository.AddAsync(user);
            }

            await _auditService.LogActionAsync(
                "admin",
                "Admin",
                "CREAR",
                "Personal",
                $"Registrado nuevo colaborador: {created.Name} como {created.Role} ({created.Email})."
            );

            return CreatedAtAction(nameof(Get), new { idOrEmail = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] CreateEmployeeRequest req)
    {
        try
        {
            var employee = new Employee
            {
                Uuid = uuid,
                Name = req.Name,
                Role = req.Role,
                Specialty = req.Specialty,
                Phone = req.Phone,
                Email = req.Email,
                Schedule = req.Schedule,
                IsActive = req.IsActive
            };

            var updated = await _service.UpdateEmployeeAsync(uuid, employee);

            // Update user password if provided
            if (!string.IsNullOrWhiteSpace(req.Username) && !string.IsNullOrWhiteSpace(req.Password))
            {
                var existingUser = await _userRepository.GetByUsernameAsync(req.Username.Trim());
                if (existingUser != null)
                {
                    existingUser.PasswordHash = LovelyPetShop.Business.Security.PasswordHasher.HashPassword(req.Password);
                    existingUser.FullName = req.Name;
                    await _userRepository.UpdateAsync(existingUser);
                }
            }

            await _auditService.LogActionAsync(
                "admin",
                "Admin",
                "ACTUALIZAR",
                "Personal",
                $"Actualizados datos del empleado: {updated.Name} ({updated.Role})."
            );

            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Empleado no encontrado." });
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var existing = await _service.GetEmployeeByIdAsync(uuid);
        var deleted = await _service.DeleteEmployeeAsync(uuid);
        if (!deleted) return NotFound(new { message = "Empleado no encontrado." });

        if (existing != null)
        {
            await _auditService.LogActionAsync(
                "admin",
                "Admin",
                "ELIMINAR",
                "Personal",
                $"Eliminado registro de colaborador: {existing.Name} ({existing.Role})."
            );
        }

        return NoContent();
    }
}
