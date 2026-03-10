namespace Anansi.Application.DTOs;

public record QuickShareLinkDto(
    Guid Id,
    Guid CollectionId,
    string Token,
    string MediaIds,
    bool IsRevoked,
    DateTime CreatedAt
);
