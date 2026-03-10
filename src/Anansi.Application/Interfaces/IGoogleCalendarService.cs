namespace Anansi.Application.Interfaces;

public interface IGoogleCalendarService
{
    Task<string> CreateEventAsync(string calendarId, string title, DateTime start, DateTime end, string? attendeeEmail = null, CancellationToken ct = default);
    Task UpdateEventAsync(string calendarId, string eventId, string title, DateTime start, DateTime end, CancellationToken ct = default);
    Task DeleteEventAsync(string calendarId, string eventId, CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEventDto>> GetEventsAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEventDto>> GetBusyTimesAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default);
}

public class CalendarEventDto
{
    public string EventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public bool IsBusy { get; set; }
    public string? AttendeeEmail { get; set; }
}
