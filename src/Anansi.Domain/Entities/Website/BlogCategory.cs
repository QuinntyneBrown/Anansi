using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.3.1/3.3.2 - Blog categories for post classification and filtering.
/// </summary>
public class BlogCategory : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }

    public ICollection<BlogPostCategory> BlogPostCategories { get; set; } = new List<BlogPostCategory>();
}
