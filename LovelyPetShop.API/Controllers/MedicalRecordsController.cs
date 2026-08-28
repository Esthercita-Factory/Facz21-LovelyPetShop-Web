using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/medical-records")]
public class MedicalRecordsController : ControllerBase
{
    private readonly IMedicalRecordService _service;
    private readonly IPetService _petService;
    private readonly IOwnerService _ownerService;

    public MedicalRecordsController(
        IMedicalRecordService service,
        IPetService petService,
        IOwnerService ownerService)
    {
        _service = service;
        _petService = petService;
        _ownerService = ownerService;
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
        if (result == null) return NotFound(new { message = "Registro médico no encontrado." });
        return Ok(result);
    }

    [HttpGet("pet/{petUuid}")]
    public async Task<IActionResult> GetByPet(string petUuid)
    {
        var result = await _service.GetRecordsByPetAsync(petUuid);
        return Ok(result);
    }

    [HttpGet("vaccine-alerts")]
    public async Task<IActionResult> GetVaccineAlerts()
    {
        var allRecords = await _service.GetAllRecordsAsync();
        var allPets = await _petService.GetAllPetsAsync();
        var allOwners = await _ownerService.GetAllOwnersAsync();

        var petsDict = allPets.ToDictionary(p => p.Uuid, p => p);
        var ownersDict = allOwners.ToDictionary(o => o.Uuid, o => o);
        var ownersByDoc = allOwners.ToDictionary(o => o.DocumentNumber, o => o);

        var today = DateTime.Today;

        var alerts = allRecords
            .Where(r => r.NextVaccineDate.HasValue)
            .OrderBy(r => r.NextVaccineDate)
            .Select(r =>
            {
                petsDict.TryGetValue(r.PetUuid, out var pet);
                Owner? owner = null;
                if (pet != null)
                {
                    if (!string.IsNullOrEmpty(pet.OwnerUuid) && ownersDict.TryGetValue(pet.OwnerUuid, out var o1))
                        owner = o1;
                    else if (!string.IsNullOrEmpty(pet.OwnerDocumentNumber) && ownersByDoc.TryGetValue(pet.OwnerDocumentNumber, out var o2))
                        owner = o2;
                }

                var nextDate = r.NextVaccineDate!.Value.Date;
                var daysDiff = (nextDate - today).TotalDays;

                string status;
                if (daysDiff < 0) status = "Vencida";
                else if (daysDiff <= 7) status = "Urgente (7 días)";
                else if (daysDiff <= 30) status = "Próxima (30 días)";
                else status = "Al Día";

                return new
                {
                    record_uuid = r.Uuid,
                    pet_uuid = r.PetUuid,
                    pet_name = pet?.Name ?? "Mascota",
                    species = pet?.Species ?? "Perro",
                    breed = pet?.Breed ?? "Sin raza",
                    owner_name = owner?.Name ?? "Propietario",
                    owner_phone = owner?.Phone ?? "",
                    owner_email = owner?.Email ?? "",
                    last_vaccine_date = r.Date,
                    next_vaccine_date = r.NextVaccineDate,
                    treatment = r.Treatment,
                    diagnosis = r.Diagnosis,
                    days_remaining = (int)daysDiff,
                    status
                };
            })
            .ToList();

        return Ok(alerts);
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
            return NotFound(new { message = "Registro médico no encontrado." });
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var deleted = await _service.DeleteRecordAsync(uuid);
        if (!deleted) return NotFound(new { message = "Registro médico no encontrado." });
        return NoContent();
    }
}
