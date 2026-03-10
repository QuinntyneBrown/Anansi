using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Galleries;

public class GalleryActivity : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public ActivityType ActivityType { get; set; }

    // Who
    public string? ActorName { get; set; }
    public string? ActorEmail { get; set; }

    // What
    public Guid? MediaId { get; set; }
    public Guid? FavoriteListId { get; set; }
    public string? Details { get; set; }

    // Download-specific
    public DownloadResolution? Resolution { get; set; }
    public bool? IsFullGallery { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
}
