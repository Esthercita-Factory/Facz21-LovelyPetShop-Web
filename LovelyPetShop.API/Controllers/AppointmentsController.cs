using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAppointmentsAsync();
        return Ok(result);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> Get(string uuid)
    {
        var result = await _service.GetAppointmentByIdAsync(uuid);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("pet/{petUuid}")]
    public async Task<IActionResult> GetByPet(string petUuid)
    {
        var result = await _service.GetAppointmentsByPetAsync(petUuid);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Appointment appointment)
    {
        try
        {
            var created = await _service.CreateAppointmentAsync(appointment);
            return CreatedAtAction(nameof(Get), new { uuid = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] Appointment appointment)
    {
        try
        {
            var updated = await _service.UpdateAppointmentAsync(uuid, appointment);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var deleted = await _service.DeleteAppointmentAsync(uuid);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
