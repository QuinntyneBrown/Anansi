using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Integrations;

public class GalleryAssistConfig : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool ShowFavoritingGuide { get; set; } = true;
    public bool ShowDownloadGuide { get; set; } = true;
    public bool ShowStoreGuide { get; set; } = true;
    public bool ShowSharingGuide { get; set; } = true;

    public Photographer? Photographer { get; set; }
}
