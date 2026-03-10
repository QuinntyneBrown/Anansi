using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Presets;

public class EditingPreset : BaseEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>
    /// Null for system presets; set to the owning photographer for user-created presets.
    /// </summary>
    public Guid? PhotographerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SkinToneRange SkinToneRange { get; set; }
    public ShootingContext ShootingContext { get; set; }
    public bool IsPublic { get; set; }
    public bool IsSystemPreset { get; set; }
    public int FavoriteCount { get; set; }

    // Basic adjustments
    public double Temperature { get; set; }
    public double Tint { get; set; }
    public double Exposure { get; set; }
    public double Contrast { get; set; }
    public double Highlights { get; set; }
    public double Shadows { get; set; }
    public double Whites { get; set; }
    public double Blacks { get; set; }
    public double Clarity { get; set; }
    public double Vibrance { get; set; }
    public double Saturation { get; set; }

    // HSL stored as JSON: array of 8 objects {Hue, Saturation, Luminance}
    // Channels: Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta
    public string HslAdjustments { get; set; } = "[]";

    // Split toning
    public double SplitToneHighlightHue { get; set; }
    public double SplitToneHighlightSaturation { get; set; }
    public double SplitToneShadowHue { get; set; }
    public double SplitToneShadowSaturation { get; set; }

    // Auditable / Soft-delete
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public ICollection<PresetFavorite> Favorites { get; set; } = new List<PresetFavorite>();
}
