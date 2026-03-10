using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Discovery;

public class CulturalTag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsSystem { get; set; }
}
