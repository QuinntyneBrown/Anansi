using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.3.1 - Blog Post Management: rich text, images, scheduling, categories.
/// WEB-3.3.3 - Blog Migration support via ImportedFromUrl.
/// </summary>
public class BlogPost : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid WebsiteId { get; set; }
    public Website Website { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string BodyHtml { get; set; } = string.Empty;
    public string? FeaturedImageUrl { get; set; }
    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;
    public DateTime? PublishDate { get; set; }
    public DateTime? ScheduledPublishDate { get; set; }

    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? OgImageUrl { get; set; }

    // Migration (WEB-3.3.3)
    public string? ImportedFromUrl { get; set; }
    public DateTime? ImportedAt { get; set; }

    // Soft delete & audit
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    public ICollection<BlogPostCategory> BlogPostCategories { get; set; } = new List<BlogPostCategory>();
}
