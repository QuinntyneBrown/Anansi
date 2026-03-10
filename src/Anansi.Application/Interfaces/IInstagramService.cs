namespace Anansi.Application.Interfaces;

public interface IInstagramService
{
    Task<IReadOnlyList<InstagramPost>> GetFeedAsync(string accessToken, int count, CancellationToken ct = default);
}

public class InstagramPost
{
    public string Id { get; set; } = string.Empty;
    public string MediaUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? Caption { get; set; }
    public string Permalink { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
