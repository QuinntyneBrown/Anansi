using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Integrations;

public class CustomCodeInjection : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public string Code { get; set; } = string.Empty;
    public CodeInjectionLocation Location { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Label { get; set; }

    public Photographer? Photographer { get; set; }
}
