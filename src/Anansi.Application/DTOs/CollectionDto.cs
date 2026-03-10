using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record CollectionDto(
    Guid Id,
    string Title,
    string? Description,
    string Slug,
    CollectionStatus Status,
    CoverStyle CoverStyle,
    Guid? CoverPhotoId,
    double? CoverFocalPointX,
    double? CoverFocalPointY,
    string? CoverVideoUrl,
    ThemeMode Theme,
    string FontFamily,
    string ColorPalette,
    string? CustomColorHex,
    GridLayout Layout,
    bool DownloadsEnabled,
    bool DownloadPinEnabled,
    string? DownloadPin,
    int? DownloadLimit,
    int DownloadCount,
    string AllowedResolutions,
    int? FavoriteLimit,
    SlideshowSpeed SlideshowSpeed,
    bool SlideshowAutoLoop,
    DateTime? ExpiresAt,
    GalleryLanguage Language,
    bool EmbeddingEnabled,
    string? GoogleAnalyticsPropertyId,
    bool IsStarred,
    bool RequireEmailRegistration,
    bool HasPassword,
    bool HasClientExclusivePassword,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int SetCount,
    int MediaCount
);

public record CollectionSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    CollectionStatus Status,
    CoverStyle CoverStyle,
    bool IsStarred,
    GalleryLanguage Language,
    DateTime CreatedAt,
    int SetCount,
    int MediaCount
);
