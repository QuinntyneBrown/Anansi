using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Discovery;

public class PhotographerCulturalTag : BaseEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CulturalTagId { get; set; }
    public CulturalTag CulturalTag { get; set; } = null!;
}
