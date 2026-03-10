using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.1.1 - Template Library: professionally designed templates.
/// </summary>
public class WebsiteTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TemplateCategory Category { get; set; }
    public string? PreviewImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string LayoutDefinitionJson { get; set; } = "{}";
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<Website> Websites { get; set; } = new List<Website>();
}
