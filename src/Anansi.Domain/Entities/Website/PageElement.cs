using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.1.2 - Flex Editor: drag-and-drop elements with breakpoint customization.
/// WEB-3.2.2 - Client Gallery Blocks, WEB-3.2.3 - Instagram Feed,
/// WEB-3.2.4 - Custom Embed, WEB-3.2.5 - Landing Page Templates.
/// </summary>
public class PageElement : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid PageId { get; set; }
    public WebsitePage Page { get; set; } = null!;

    public ElementType ElementType { get; set; }
    public string? ContentJson { get; set; }

    // Position & sizing (varies per breakpoint)
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }

    // Layer management (WEB-3.1.2)
    public int ZIndex { get; set; }
    public int SortOrder { get; set; }

    // Parent element for nested layouts
    public Guid? ParentElementId { get; set; }
    public PageElement? ParentElement { get; set; }

    public ICollection<PageElement> ChildElements { get; set; } = new List<PageElement>();
    public ICollection<ElementBreakpointOverride> BreakpointOverrides { get; set; } = new List<ElementBreakpointOverride>();
}
