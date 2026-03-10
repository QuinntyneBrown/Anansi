using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Galleries;

public class Collection : BaseEntity, ITenantEntity, IAuditableEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CollectionStatus Status { get; set; } = CollectionStatus.Draft;
    public string Slug { get; set; } = string.Empty;

    // Cover settings (GAL-1.3.1, GAL-1.3.2)
    public CoverStyle CoverStyle { get; set; } = CoverStyle.Reef;
    public Guid? CoverPhotoId { get; set; }
    public double? CoverFocalPointX { get; set; }
    public double? CoverFocalPointY { get; set; }
    public string? CoverVideoUrl { get; set; }
    public bool CoverVideoAutoplay { get; set; } = true;

    // Design settings (GAL-1.3.3 through GAL-1.3.6)
    public ThemeMode Theme { get; set; } = ThemeMode.Light;
    public string FontFamily { get; set; } = "Inter";
    public string ColorPalette { get; set; } = "Default";
    public string? CustomColorHex { get; set; }
    public GridLayout Layout { get; set; } = GridLayout.Vertical;

    // Privacy settings (GAL-1.6.1 through GAL-1.6.4)
    public string? Password { get; set; }
    public string? ClientExclusivePassword { get; set; }
    public bool RequireEmailRegistration { get; set; }

    // Download settings (GAL-1.4.1 through GAL-1.4.3)
    public bool DownloadsEnabled { get; set; } = true;
    public string? DownloadPin { get; set; }
    public bool DownloadPinEnabled { get; set; } = true;
    public int? DownloadLimit { get; set; }
    public int DownloadCount { get; set; }
    public string AllowedResolutions { get; set; } = "Web640,Web1024,Web2048";

    // Favorites/Proofing settings (GAL-1.5.4)
    public int? FavoriteLimit { get; set; }

    // Slideshow settings (GAL-1.3.8)
    public SlideshowSpeed SlideshowSpeed { get; set; } = SlideshowSpeed.Medium;
    public bool SlideshowAutoLoop { get; set; } = true;

    // Expiry settings (GAL-1.6.6, GAL-1.6.7)
    public DateTime? ExpiresAt { get; set; }
    public string? ExpiryReminderRecipients { get; set; }
    public string? ExpiryReminderDays { get; set; }
    public string? ExpiryReminderEmailTemplate { get; set; }

    // Multi-language (GAL-1.8.1)
    public GalleryLanguage Language { get; set; } = GalleryLanguage.English;

    // Sharing (GAL-1.7.5)
    public bool EmbeddingEnabled { get; set; }
    public string? EmbedCode { get; set; }

    // Analytics (GAL-1.9.2)
    public string? GoogleAnalyticsPropertyId { get; set; }

    // Star/Bookmark (GAL-1.2.3)
    public bool IsStarred { get; set; }

    // Preset reference
    public Guid? PresetId { get; set; }

    // Auditable / Soft-delete
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public ICollection<CollectionSet> Sets { get; set; } = new List<CollectionSet>();
    public ICollection<GalleryMedia> Media { get; set; } = new List<GalleryMedia>();
    public ICollection<FavoriteList> FavoriteLists { get; set; } = new List<FavoriteList>();
    public ICollection<GalleryActivity> Activities { get; set; } = new List<GalleryActivity>();
    public ICollection<GalleryEmailRegistration> EmailRegistrations { get; set; } = new List<GalleryEmailRegistration>();
    public ICollection<EmailInvitation> EmailInvitations { get; set; } = new List<EmailInvitation>();
    public ICollection<QuickShareLink> QuickShareLinks { get; set; } = new List<QuickShareLink>();
    public ICollection<DownloadRequest> DownloadRequests { get; set; } = new List<DownloadRequest>();
}
