using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Presets;

public class PresetFavorite : BaseEntity
{
    public Guid PhotographerId { get; set; }
    public Guid PresetId { get; set; }

    // Navigation
    public EditingPreset Preset { get; set; } = null!;
}
