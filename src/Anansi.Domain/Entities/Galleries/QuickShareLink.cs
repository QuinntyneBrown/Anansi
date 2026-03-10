using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class QuickShareLink : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string MediaIds { get; set; } = string.Empty; // Comma-separated GUIDs
    public bool IsRevoked { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
}
