using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class FavoriteList : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public bool IsPreset { get; set; }
    public bool IsCompleted { get; set; }
    public string? ShareToken { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
    public ICollection<FavoriteItem> Items { get; set; } = new List<FavoriteItem>();
}
