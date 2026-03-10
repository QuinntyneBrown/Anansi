using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record GalleryActivityDto(
    Guid Id,
    Guid CollectionId,
    ActivityType ActivityType,
    string? ActorName,
    string? ActorEmail,
    Guid? MediaId,
    Guid? FavoriteListId,
    string? Details,
    DownloadResolution? Resolution,
    bool? IsFullGallery,
    DateTime CreatedAt
);
