using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Notifications;

public class NotificationPreference : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public NotificationEventType EventType { get; set; }
    public bool EmailEnabled { get; set; } = true;
    public bool PushEnabled { get; set; } = true;
    public bool InAppEnabled { get; set; } = true;
    public EmailDigestOption EmailDigestOption { get; set; } = EmailDigestOption.RealTime;

    public Photographer? Photographer { get; set; }
}
