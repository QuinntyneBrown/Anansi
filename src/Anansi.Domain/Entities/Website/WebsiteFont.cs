using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.4.1 - Font System: custom uploaded fonts (WOFF, WOFF2, TTF, OTF).
/// </summary>
public class WebsiteFont : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public string FontFamily { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileFormat { get; set; } = string.Empty; // woff, woff2, ttf, otf
    public string? FontWeight { get; set; }
    public string? FontStyle { get; set; }
}
