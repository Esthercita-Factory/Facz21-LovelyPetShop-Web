using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicalRecordsController : ControllerBase
{
    private readonly IMedicalRecordService _service;

    public MedicalRecordsController(IMedicalRecordService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllRecordsAsync();
        return Ok(result);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> Get(string uuid)
    {
        var result = await _service.GetRecordByIdAsync(uuid);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("pet/{petUuid}")]
    public async Task<IActionResult> GetByPet(string petUuid)
    {
        var result = await _service.GetRecordsByPetAsync(petUuid);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MedicalRecord record)
    {
        try
        {
            var created = await _service.AddRecordAsync(record);
            return CreatedAtAction(nameof(Get), new { uuid = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] MedicalRecord record)
    {
        try
        {
            var updated = await _service.UpdateRecordAsync(uuid, record);
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
        var deleted = await _service.DeleteRecordAsync(uuid);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
