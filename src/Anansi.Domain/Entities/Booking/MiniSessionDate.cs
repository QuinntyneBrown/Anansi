using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Booking;

/// <summary>
/// A specific date and set of start times for a mini session type (BKG-4.3.3).
/// </summary>
public class MiniSessionDate : BaseEntity
{
    public Guid SessionTypeId { get; set; }
    public DateTime Date { get; set; }

    /// <summary>JSON array of start times, e.g. ["09:00","09:30","10:00"].</summary>
    public string StartTimes { get; set; } = "[]";

    // Navigation
    public SessionType SessionType { get; set; } = null!;
}
