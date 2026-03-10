using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Branding;

/// <summary>
/// BRD-7.2.1 Text Watermarks, BRD-7.2.2 Image Watermarks.
/// </summary>
public class Watermark : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public WatermarkType Type { get; set; }

    // Text watermark (BRD-7.2.1)
    public string? Text { get; set; }
    public string? FontFamily { get; set; }

    // Image watermark (BRD-7.2.2)
    public string? ImageUrl { get; set; }

    // Common settings
    public double Opacity { get; set; } = 0.5;
    public double Scale { get; set; } = 1.0;
    public WatermarkPosition Position { get; set; } = WatermarkPosition.BottomRight;
    public bool IsDefault { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
