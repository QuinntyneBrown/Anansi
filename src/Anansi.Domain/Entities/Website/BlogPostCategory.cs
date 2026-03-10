using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// Many-to-many join entity for BlogPost and BlogCategory.
/// </summary>
public class BlogPostCategory : BaseEntity
{
    public Guid BlogPostId { get; set; }
    public BlogPost BlogPost { get; set; } = null!;

    public Guid BlogCategoryId { get; set; }
    public BlogCategory BlogCategory { get; set; } = null!;
}
