namespace LovelyPetShop.API.DTOs;

public record PetDto(
    string Uuid,
    string Name,
    string Species,
    string Breed,
    int Age,
    double Weight,
    string Symptoms,
    string OwnerDocumentNumber,
    string OwnerUuid,
    DateTime CreatedAt
);

public record CreatePetDto(
    string Name,
    string Species,
    string Breed,
    int Age,
    double Weight,
    string Symptoms,
    string OwnerDocumentNumber
);

public record CreatePetWithOwnerDto(
    string PetName,
    string Species,
    string Breed,
    int Age,
    double Weight,
    string Symptoms,
    string DocType,
    string DocNumber,
    string OwnerName,
    string OwnerPhone,
    string OwnerEmail,
    string OwnerAddress
);

public record UpdatePetDto(
    string? Name,
    string? Species,
    string? Breed,
    int? Age,
    double? Weight,
    string? Symptoms,
    string? OwnerDocumentNumber
);
