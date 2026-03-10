using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record GalleryMediaDto(
    Guid Id,
    Guid CollectionId,
    Guid? SetId,
    string FileName,
    string OriginalFileName,
    MediaType MediaType,
    string ContentType,
    long FileSizeBytes,
    int? Width,
    int? Height,
    string? CameraMake,
    string? CameraModel,
    string? LensModel,
    double? FocalLength,
    string? Aperture,
    string? ShutterSpeed,
    int? Iso,
    DateTime? DateTaken,
    TimeSpan? Duration,
    string? VideoResolution,
    int SortOrder,
    bool IsStarred,
    bool IsPrivate,
    DateTime CreatedAt
);
