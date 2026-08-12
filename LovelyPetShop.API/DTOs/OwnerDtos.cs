namespace LovelyPetShop.API.DTOs;

public record OwnerDto(
    string Uuid,
    string DocumentType,
    string DocumentNumber,
    string Name,
    string Phone,
    string Email,
    string Address,
    DateTime CreatedAt,
    List<PetDto> Pets
);

public record CreateOwnerDto(
    string DocumentType,
    string DocumentNumber,
    string Name,
    string Phone,
    string Email,
    string Address
);

public record UpdateOwnerDto(
    string? NewDocumentType,
    string? NewDocumentNumber,
    string? Name,
    string? Phone,
    string? Email,
    string? Address
);
