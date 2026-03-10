using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Events;

/// <summary>
/// A Toronto Black cultural or community event (EVT-24.1.1, EVT-24.1.2).
/// </summary>
public class CommunityEvent : BaseEntity, ISoftDeletable, IAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Venue { get; set; }
    public string? Neighborhood { get; set; }
    public EventCategory Category { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public EventRecurrence Recurrence { get; set; } = EventRecurrence.None;

    /// <summary>Typical month the event starts (1-12). Used for annual recurring seed events.</summary>
    public int? TypicalStartMonth { get; set; }

    /// <summary>Typical month the event ends (1-12). Used for annual recurring seed events.</summary>
    public int? TypicalEndMonth { get; set; }

    public string? WebsiteUrl { get; set; }

    public EventStatus Status { get; set; } = EventStatus.Pending;

    /// <summary>True for system-seeded events (e.g., Caribana, Afrofest).</summary>
    public bool IsSeeded { get; set; }

    /// <summary>Nullable for seed events; set for community-submitted events.</summary>
    public Guid? SubmittedByPhotographerId { get; set; }

    // Navigation
    public ICollection<EventCalendarBlock> CalendarBlocks { get; set; } = new List<EventCalendarBlock>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
