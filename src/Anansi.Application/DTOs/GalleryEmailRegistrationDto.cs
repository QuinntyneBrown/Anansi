namespace Anansi.Application.DTOs;

public record GalleryEmailRegistrationDto(
    Guid Id,
    Guid CollectionId,
    string Name,
    string Email,
    DateTime CreatedAt
);
