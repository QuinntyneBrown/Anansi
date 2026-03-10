namespace Anansi.Application.Interfaces;

public interface IVideoCallService
{
    Task<VideoMeetingLink> CreateZoomMeetingAsync(string zoomAccountId, string topic, DateTime startTime, int durationMinutes, CancellationToken ct = default);
    Task<VideoMeetingLink> CreateGoogleMeetAsync(string calendarId, string topic, DateTime startTime, int durationMinutes, string? attendeeEmail = null, CancellationToken ct = default);
}

public class VideoMeetingLink
{
    public string MeetingUrl { get; set; } = string.Empty;
    public string? MeetingId { get; set; }
    public string? Password { get; set; }
    public string Provider { get; set; } = string.Empty;
}
