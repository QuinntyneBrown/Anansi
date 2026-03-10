using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Integrations;

public class WebhookSubscription : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Url { get; set; } = string.Empty;
    public WebhookEventType EventType { get; set; }
    public string? Secret { get; set; }
    public bool IsActive { get; set; } = true;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public Photographer? Photographer { get; set; }
}
