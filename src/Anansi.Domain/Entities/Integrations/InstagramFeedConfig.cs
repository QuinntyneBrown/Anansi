using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Integrations;

public class InstagramFeedConfig : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public int NumberOfPosts { get; set; } = 9;
    public string ImageSize { get; set; } = "medium";
    public string ClickBehavior { get; set; } = "open_instagram";
    public bool IsActive { get; set; } = true;

    public Photographer? Photographer { get; set; }
}
