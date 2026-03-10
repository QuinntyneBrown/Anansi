namespace Anansi.Application.DTOs;

public record CollectionSetDto(
    Guid Id,
    Guid CollectionId,
    string Title,
    string? Description,
    int SortOrder,
    bool IsClientExclusive,
    DateTime CreatedAt,
    int MediaCount
);
