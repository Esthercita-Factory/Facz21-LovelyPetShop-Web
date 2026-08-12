using Microsoft.AspNetCore.Mvc;
using LovelyPetShop.Domain.Interfaces;
using LovelyPetShop.API.DTOs;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IPetService _petService;
    private readonly IOwnerService _ownerService;

    public StatsController(IPetService petService, IOwnerService ownerService)
    {
        _petService = petService;
        _ownerService = ownerService;
    }

    [HttpGet]
    public async Task<ActionResult<StatsSummaryDto>> GetStats()
    {
        var pets = (await _petService.GetAllPetsAsync()).ToList();
        var owners = (await _ownerService.GetAllOwnersAsync()).ToList();

        var speciesDistribution = pets
            .GroupBy(p => string.IsNullOrWhiteSpace(p.Species) ? "Otro" : p.Species.Trim())
            .ToDictionary(g => g.Key, g => g.Count());

        double avgAge = pets.Any() ? Math.Round(pets.Average(p => p.Age), 1) : 0;
        double avgWeight = pets.Any() ? Math.Round(pets.Average(p => p.Weight), 1) : 0;

        var recentPets = pets
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new PetDto(
                p.Uuid, p.Name, p.Species, p.Breed, p.Age, p.Weight, p.Symptoms,
                p.OwnerDocumentNumber, p.OwnerUuid, p.CreatedAt))
            .ToList();

        var dto = new StatsSummaryDto(
            pets.Count,
            owners.Count,
            speciesDistribution,
            avgAge,
            avgWeight,
            recentPets
        );

        return Ok(dto);
    }
}
