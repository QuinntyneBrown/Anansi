using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.2.1 - Page Management: pages with types, slugs, ordering, password protection.
/// </summary>
public class WebsitePage : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public Guid WebsiteId { get; set; }
    public Website Website { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public WebsitePageType PageType { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public bool ShowInNavigation { get; set; } = true;

    // Password protection per page (WEB-3.6.3)
    public string? PagePasswordHash { get; set; }

    // SEO (WEB-3.5.1, WEB-3.5.3, WEB-3.5.5)
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? OgImageUrl { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public ICollection<PageElement> Elements { get; set; } = new List<PageElement>();
}
