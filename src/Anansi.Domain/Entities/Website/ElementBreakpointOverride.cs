using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.1.2 - Breakpoint customization: per-breakpoint overrides for element positioning.
/// </summary>
public class ElementBreakpointOverride : BaseEntity
{
    public Guid PageElementId { get; set; }
    public PageElement PageElement { get; set; } = null!;

    public Breakpoint Breakpoint { get; set; }
    public double? PositionX { get; set; }
    public double? PositionY { get; set; }
    public double? Width { get; set; }
    public double? Height { get; set; }
    public bool IsHidden { get; set; }
    public string? StyleOverridesJson { get; set; }
}
