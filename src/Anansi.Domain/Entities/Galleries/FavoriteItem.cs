using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class FavoriteItem : BaseEntity
{
    public Guid FavoriteListId { get; set; }
    public Guid MediaId { get; set; }
    public string? Comment { get; set; }

    // Navigation
    public FavoriteList FavoriteList { get; set; } = null!;
    public GalleryMedia Media { get; set; } = null!;
}
