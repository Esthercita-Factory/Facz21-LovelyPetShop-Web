using Microsoft.AspNetCore.Mvc;
using LovelyPetShop.Domain.Interfaces;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.API.DTOs;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OwnersController : ControllerBase
{
    private readonly IOwnerService _ownerService;

    public OwnersController(IOwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OwnerDto>>> GetAll()
    {
        var owners = await _ownerService.GetAllOwnersAsync();
        var dtos = owners.Select(MapOwnerToDto);
        return Ok(dtos);
    }

    [HttpGet("{docOrUuid}")]
    public async Task<ActionResult<OwnerDto>> GetByDocumentOrUuid(string docOrUuid)
    {
        var owner = await _ownerService.GetOwnerByDocumentAsync(docOrUuid);
        if (owner == null)
        {
            var all = await _ownerService.GetAllOwnersAsync();
            owner = all.FirstOrDefault(o => string.Equals(o.Uuid, docOrUuid, StringComparison.OrdinalIgnoreCase));
        }
        if (owner == null) return NotFound(new { message = $"Propietario '{docOrUuid}' no fue encontrado." });
        return Ok(MapOwnerToDto(owner));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateOwnerDto dto)
    {
        var result = await _ownerService.CreateOwnerAsync(dto.DocumentType, dto.DocumentNumber, dto.Name, dto.Phone, dto.Email, dto.Address);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var created = await _ownerService.GetOwnerByDocumentAsync(dto.DocumentNumber);
        return CreatedAtAction(nameof(GetByDocumentOrUuid), new { docOrUuid = dto.DocumentNumber }, created != null ? MapOwnerToDto(created) : null);
    }

    [HttpPut("{docOrUuid}")]
    public async Task<ActionResult> Update(string docOrUuid, [FromBody] UpdateOwnerDto dto)
    {
        var targetDoc = docOrUuid;
        var existing = await _ownerService.GetOwnerByDocumentAsync(docOrUuid);
        if (existing == null)
        {
            var all = await _ownerService.GetAllOwnersAsync();
            var byUuid = all.FirstOrDefault(o => string.Equals(o.Uuid, docOrUuid, StringComparison.OrdinalIgnoreCase));
            if (byUuid != null) targetDoc = byUuid.DocumentNumber;
        }

        var result = await _ownerService.UpdateOwnerAsync(targetDoc, dto.NewDocumentType, dto.NewDocumentNumber, dto.Name, dto.Phone, dto.Email, dto.Address);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var updatedDoc = dto.NewDocumentNumber ?? targetDoc;
        var updated = await _ownerService.GetOwnerByDocumentAsync(updatedDoc);
        return Ok(new { message = result.Message, owner = updated != null ? MapOwnerToDto(updated) : null });
    }

    [HttpDelete("{docOrUuid}")]
    public async Task<ActionResult> Delete(string docOrUuid)
    {
        var result = await _ownerService.DeleteOwnerAsync(docOrUuid);
        if (!result.Success)
        {
            var all = await _ownerService.GetAllOwnersAsync();
            var byUuid = all.FirstOrDefault(o => string.Equals(o.Uuid, docOrUuid, StringComparison.OrdinalIgnoreCase));
            if (byUuid != null)
            {
                result = await _ownerService.DeleteOwnerAsync(byUuid.DocumentNumber);
            }
        }
        if (!result.Success) return NotFound(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    private static OwnerDto MapOwnerToDto(Owner o)
    {
        return new OwnerDto(
            o.Uuid,
            o.DocumentType,
            o.DocumentNumber,
            o.Name,
            o.Phone,
            o.Email,
            o.Address,
            o.CreatedAt,
            (o.Pets ?? new List<Pet>()).Select(MapPetToDto).ToList()
        );
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
