using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.4.2 - Color System: predefined and custom color palettes.
/// </summary>
public class ColorPalette : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ColorsJson { get; set; } = "[]"; // JSON array of hex colors
    public bool IsSystem { get; set; } = true;
    public Guid? PhotographerId { get; set; } // null = system palette
    public int SortOrder { get; set; }
}
