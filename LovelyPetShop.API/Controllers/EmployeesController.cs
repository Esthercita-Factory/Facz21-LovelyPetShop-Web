using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;

    public EmployeesController(IEmployeeService service)
    {
        _service = service;
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
    public async Task<IActionResult> Create([FromBody] Employee employee)
    {
        try
        {
            var created = await _service.CreateEmployeeAsync(employee);
            return CreatedAtAction(nameof(Get), new { idOrEmail = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] Employee employee)
    {
        try
        {
            var updated = await _service.UpdateEmployeeAsync(uuid, employee);
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
        var deleted = await _service.DeleteEmployeeAsync(uuid);
        if (!deleted) return NotFound(new { message = "Empleado no encontrado." });
        return NoContent();
    }
}
