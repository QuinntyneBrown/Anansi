using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record DownloadRequestDto(
    Guid Id,
    Guid CollectionId,
    string? RequestedBy,
    string? RequestedByEmail,
    DownloadResolution Resolution,
    bool IsFullGallery,
    string? MediaIds,
    bool IsReady,
    DateTime? ReadyAt,
    DateTime? ExpiresAt,
    DateTime CreatedAt
);
