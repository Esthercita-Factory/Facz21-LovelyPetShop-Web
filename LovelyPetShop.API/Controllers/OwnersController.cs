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

    [HttpGet("{docNumber}")]
    public async Task<ActionResult<OwnerDto>> GetByDocument(string docNumber)
    {
        var owner = await _ownerService.GetOwnerByDocumentAsync(docNumber);
        if (owner == null) return NotFound(new { message = $"Propietario con documento '{docNumber}' no fue encontrado." });
        return Ok(MapOwnerToDto(owner));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateOwnerDto dto)
    {
        var result = await _ownerService.CreateOwnerAsync(dto.DocumentType, dto.DocumentNumber, dto.Name, dto.Phone, dto.Email, dto.Address);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var created = await _ownerService.GetOwnerByDocumentAsync(dto.DocumentNumber);
        return CreatedAtAction(nameof(GetByDocument), new { docNumber = dto.DocumentNumber }, created != null ? MapOwnerToDto(created) : null);
    }

    [HttpPut("{docNumber}")]
    public async Task<ActionResult> Update(string docNumber, [FromBody] UpdateOwnerDto dto)
    {
        var result = await _ownerService.UpdateOwnerAsync(docNumber, dto.NewDocumentType, dto.NewDocumentNumber, dto.Name, dto.Phone, dto.Email, dto.Address);
        if (!result.Success) return BadRequest(new { message = result.Message });

        var updatedDoc = dto.NewDocumentNumber ?? docNumber;
        var updated = await _ownerService.GetOwnerByDocumentAsync(updatedDoc);
        return Ok(new { message = result.Message, owner = updated != null ? MapOwnerToDto(updated) : null });
    }

    [HttpDelete("{docNumber}")]
    public async Task<ActionResult> Delete(string docNumber)
    {
        var result = await _ownerService.DeleteOwnerAsync(docNumber);
        if (!result.Success) return BadRequest(new { message = result.Message });
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
            o.Pets.Select(MapPetToDto).ToList()
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
