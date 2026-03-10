using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class GalleryEmailRegistration : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Navigation
    public Collection Collection { get; set; } = null!;
}
