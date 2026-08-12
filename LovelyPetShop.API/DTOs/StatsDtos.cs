namespace LovelyPetShop.API.DTOs;

public record StatsSummaryDto(
    int TotalPets,
    int TotalOwners,
    Dictionary<string, int> SpeciesDistribution,
    double AverageAge,
    double AverageWeight,
    List<PetDto> RecentPets
);
