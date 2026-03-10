using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Galleries;

public class CollectionPreset : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;

    // Design
    public CoverStyle CoverStyle { get; set; } = CoverStyle.Reef;
    public ThemeMode Theme { get; set; } = ThemeMode.Light;
    public string FontFamily { get; set; } = "Inter";
    public string ColorPalette { get; set; } = "Default";
    public string? CustomColorHex { get; set; }
    public GridLayout Layout { get; set; } = GridLayout.Vertical;

    // Download
    public bool DownloadsEnabled { get; set; } = true;
    public bool DownloadPinEnabled { get; set; } = true;
    public string AllowedResolutions { get; set; } = "Web640,Web1024,Web2048";

    // Privacy
    public bool RequireEmailRegistration { get; set; }

    // Language
    public GalleryLanguage Language { get; set; } = GalleryLanguage.English;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
