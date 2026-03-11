using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubVideoCallService : IVideoCallService
{
    private readonly ILogger<StubVideoCallService> _logger;

    public StubVideoCallService(ILogger<StubVideoCallService> logger)
    {
        _logger = logger;
    }

    public Task<VideoMeetingLink> CreateZoomMeetingAsync(string zoomAccountId, string topic, DateTime startTime, int durationMinutes, CancellationToken ct = default)
    {
        _logger.LogInformation("Zoom meeting created: {Topic}", topic);
        return Task.FromResult(new VideoMeetingLink { MeetingUrl = "https://zoom.us/stub", MeetingId = Guid.NewGuid().ToString("N"), Provider = "Zoom" });
    }

    public Task<VideoMeetingLink> CreateGoogleMeetAsync(string calendarId, string topic, DateTime startTime, int durationMinutes, string? attendeeEmail = null, CancellationToken ct = default)
    {
        _logger.LogInformation("Google Meet created: {Topic}", topic);
        return Task.FromResult(new VideoMeetingLink { MeetingUrl = "https://meet.google.com/stub", MeetingId = Guid.NewGuid().ToString("N"), Provider = "GoogleMeet" });
    }
}
