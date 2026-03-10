using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Events;

/// <summary>
/// A calendar block synced from an event to a photographer's booking calendar (EVT-24.2.2).
/// </summary>
public class EventCalendarBlock : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CommunityEventId { get; set; }
    public CalendarBlockType BlockType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Navigation
    public CommunityEvent CommunityEvent { get; set; } = null!;
}
