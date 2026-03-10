using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class CollectionSet : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }

    // Privacy (GAL-1.6.2)
    public bool IsClientExclusive { get; set; }

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
    public ICollection<GalleryMedia> Media { get; set; } = new List<GalleryMedia>();
}
