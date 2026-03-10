using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record CollectionPresetDto(
    Guid Id,
    string Name,
    CoverStyle CoverStyle,
    ThemeMode Theme,
    string FontFamily,
    string ColorPalette,
    string? CustomColorHex,
    GridLayout Layout,
    bool DownloadsEnabled,
    bool DownloadPinEnabled,
    string AllowedResolutions,
    bool RequireEmailRegistration,
    GalleryLanguage Language,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
