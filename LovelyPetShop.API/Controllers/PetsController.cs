using Microsoft.AspNetCore.Mvc;
using LovelyPetShop.Domain.Interfaces;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.API.DTOs;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetAll()
    {
        var pets = await _petService.GetAllPetsAsync();
        return Ok(pets.Select(MapPetToDto));
    }

    [HttpGet("{uuid}")]
    public async Task<ActionResult<PetDto>> GetByUuid(string uuid)
    {
        var pet = await _petService.GetPetByUuidAsync(uuid);
        if (pet == null) return NotFound(new { message = $"Mascota con UUID '{uuid}' no fue encontrada." });
        return Ok(MapPetToDto(pet));
    }

    [HttpGet("by-owner/{docNumber}")]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetByOwner(string docNumber)
    {
        var pets = await _petService.GetPetsByOwnerDocumentAsync(docNumber);
        return Ok(pets.Select(MapPetToDto));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePetDto dto)
    {
        var result = await _petService.CreatePetAsync(dto.Name, dto.Species, dto.Breed, dto.Age, dto.Weight, dto.Symptoms, dto.OwnerDocumentNumber);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var created = await _petService.GetPetByUuidAsync(result.CreatedUuid!);
        return CreatedAtAction(nameof(GetByUuid), new { uuid = result.CreatedUuid }, created != null ? MapPetToDto(created) : null);
    }

    [HttpPost("with-owner")]
    public async Task<ActionResult> CreateWithOwner([FromBody] CreatePetWithOwnerDto dto)
    {
        var result = await _petService.CreatePetWithOwnerAsync(
            dto.PetName, dto.Species, dto.Breed, dto.Age, dto.Weight, dto.Symptoms,
            dto.DocType, dto.DocNumber, dto.OwnerName, dto.OwnerPhone, dto.OwnerEmail, dto.OwnerAddress);

        if (!result.Success) return BadRequest(new { message = result.Message });

        var createdPet = await _petService.GetPetByUuidAsync(result.CreatedPetUuid!);
        return Ok(new { message = result.Message, petUuid = result.CreatedPetUuid, ownerUuid = result.CreatedOwnerUuid, pet = createdPet != null ? MapPetToDto(createdPet) : null });
    }

    [HttpPut("{uuid}")]
    public async Task<ActionResult> Update(string uuid, [FromBody] UpdatePetDto dto)
    {
        var result = await _petService.UpdatePetAsync(uuid, dto.Name, dto.Species, dto.Breed, dto.Age, dto.Weight, dto.Symptoms, dto.OwnerDocumentNumber);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var updated = await _petService.GetPetByUuidAsync(uuid);
        return Ok(new { message = result.Message, pet = updated != null ? MapPetToDto(updated) : null });
    }

    [HttpDelete("{uuid}")]
    public async Task<ActionResult> Delete(string uuid)
    {
        var result = await _petService.DeletePetAsync(uuid);
        if (!result.Success) return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    private static PetDto MapPetToDto(Pet p)
    {
        return new PetDto(
            p.Uuid,
            p.Name,
            p.Species,
            p.Breed,
            p.Age,
            p.Weight,
            p.Symptoms,
            p.OwnerDocumentNumber,
            p.OwnerUuid,
            p.CreatedAt
        );
    }
}
