using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Notifications;

public class Notification : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public NotificationEventType EventType { get; set; }
    public NotificationCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    public Photographer? Photographer { get; set; }
}
