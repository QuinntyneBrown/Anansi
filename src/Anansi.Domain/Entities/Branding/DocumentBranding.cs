using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Branding;

/// <summary>
/// BRD-7.4.1 Document Branding: per-document-type header images and brand colors.
/// BRD-7.4.2 Font Theme: font theme for branded documents/emails.
/// </summary>
public class DocumentBranding : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string? HeaderImageUrl { get; set; }
    public string? BrandColorHex { get; set; }
    public string? SecondaryColorHex { get; set; }
    public string? FontTheme { get; set; }
}
