using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubGoogleCalendarService : IGoogleCalendarService
{
    private readonly ILogger<StubGoogleCalendarService> _logger;

    public StubGoogleCalendarService(ILogger<StubGoogleCalendarService> logger)
    {
        _logger = logger;
    }

    public Task<string> CreateEventAsync(string calendarId, string title, DateTime start, DateTime end, string? attendeeEmail = null, CancellationToken ct = default)
    {
        var id = $"evt_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("Calendar event created: {Id} - {Title}", id, title);
        return Task.FromResult(id);
    }

    public Task UpdateEventAsync(string calendarId, string eventId, string title, DateTime start, DateTime end, CancellationToken ct = default)
    {
        _logger.LogInformation("Calendar event updated: {EventId}", eventId);
        return Task.CompletedTask;
    }

    public Task DeleteEventAsync(string calendarId, string eventId, CancellationToken ct = default)
    {
        _logger.LogInformation("Calendar event deleted: {EventId}", eventId);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<CalendarEventDto>> GetEventsAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        _logger.LogInformation("Calendar events fetched: {From} to {To}", from, to);
        return Task.FromResult<IReadOnlyList<CalendarEventDto>>(Array.Empty<CalendarEventDto>());
    }

    public Task<IReadOnlyList<CalendarEventDto>> GetBusyTimesAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        _logger.LogInformation("Calendar busy times fetched: {From} to {To}", from, to);
        return Task.FromResult<IReadOnlyList<CalendarEventDto>>(Array.Empty<CalendarEventDto>());
    }
}
