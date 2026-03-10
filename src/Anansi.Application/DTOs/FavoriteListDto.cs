namespace Anansi.Application.DTOs;

public record FavoriteListDto(
    Guid Id,
    Guid CollectionId,
    string Name,
    string? ClientName,
    string? ClientEmail,
    bool IsPreset,
    bool IsCompleted,
    string? ShareToken,
    int ItemCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record FavoriteItemDto(
    Guid Id,
    Guid FavoriteListId,
    Guid MediaId,
    string? Comment,
    string? MediaFileName,
    DateTime CreatedAt
);
