using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.2.5 - Landing Page Templates: ready-made templates for one-click addition.
/// </summary>
public class LandingPageTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UseCase { get; set; } = string.Empty; // booking, mini-session-promo, etc.
    public string LayoutDefinitionJson { get; set; } = "{}";
    public string? PreviewImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
