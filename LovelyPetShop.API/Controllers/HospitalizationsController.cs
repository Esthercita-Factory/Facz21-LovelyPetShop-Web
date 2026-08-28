using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalizationsController : ControllerBase
{
    private readonly IHospitalizationService _service;

    public HospitalizationsController(IHospitalizationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _service.GetActiveAsync();
        return Ok(result);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> Get(string uuid)
    {
        var result = await _service.GetByUuidAsync(uuid);
        if (result == null) return NotFound(new { message = "Registro de hospitalización no encontrado." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Hospitalization hospitalization)
    {
        try
        {
            var user = User?.Identity?.Name ?? "Staff";
            var created = await _service.CreateAsync(hospitalization, user);
            return CreatedAtAction(nameof(Get), new { uuid = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] Hospitalization hospitalization)
    {
        try
        {
            var user = User?.Identity?.Name ?? "Staff";
            var updated = await _service.UpdateAsync(uuid, hospitalization, user);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Registro de hospitalización no encontrado." });
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var user = User?.Identity?.Name ?? "Staff";
        var deleted = await _service.DeleteAsync(uuid, user);
        if (!deleted) return NotFound(new { message = "Registro no encontrado." });
        return NoContent();
    }
}
