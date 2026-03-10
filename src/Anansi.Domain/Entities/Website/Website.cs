using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.1.1 through WEB-3.7.3 - Core website entity.
/// Supports draft sites (WEB-3.1.3), hosting (WEB-3.6.1), custom domains (WEB-3.6.2),
/// password protection (WEB-3.6.3), right-click protection (WEB-3.6.4),
/// analytics integration (WEB-3.7.1/3.7.2/3.7.3).
/// </summary>
public class Website : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WebsiteStatus Status { get; set; } = WebsiteStatus.Draft;

    // Template (WEB-3.1.1)
    public Guid? TemplateId { get; set; }
    public WebsiteTemplate? Template { get; set; }

    // Typography & Design (WEB-3.4.1, WEB-3.4.2, WEB-3.4.3)
    public string? PrimaryFontFamily { get; set; }
    public string? SecondaryFontFamily { get; set; }
    public string? CustomFontUrl { get; set; }
    public string? ColorPaletteJson { get; set; }
    public AnimationType AnimationType { get; set; } = AnimationType.None;
    public bool AnimationsEnabled { get; set; }

    // Hosting (WEB-3.6.1)
    public string Subdomain { get; set; } = string.Empty;
    public bool SslEnabled { get; set; } = true;

    // Custom Domain (WEB-3.6.2)
    public string? CustomDomain { get; set; }
    public bool CustomDomainVerified { get; set; }

    // Security (WEB-3.6.3, WEB-3.6.4)
    public string? SitePasswordHash { get; set; }
    public bool RightClickProtectionEnabled { get; set; } = true;

    // SEO defaults
    public string? DefaultMetaTitle { get; set; }
    public string? DefaultMetaDescription { get; set; }
    public string? DefaultOgImageUrl { get; set; }

    // Analytics (WEB-3.7.1, WEB-3.7.2, WEB-3.7.3)
    public bool BuiltInAnalyticsEnabled { get; set; }
    public string? GoogleAnalyticsMeasurementId { get; set; }
    public string? FacebookPixelId { get; set; }

    // Blog settings (WEB-3.3.2)
    public BlogLayoutType BlogLayout { get; set; } = BlogLayoutType.Grid;
    public int BlogPostsPerPage { get; set; } = 10;
    public bool BlogLoadMoreEnabled { get; set; }

    // Soft delete & audit
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public Photographer Photographer { get; set; } = null!;
    public ICollection<WebsitePage> Pages { get; set; } = new List<WebsitePage>();
    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
    public ICollection<UrlRedirect> UrlRedirects { get; set; } = new List<UrlRedirect>();
    public ICollection<WebsiteAnalyticsSnapshot> AnalyticsSnapshots { get; set; } = new List<WebsiteAnalyticsSnapshot>();
}
