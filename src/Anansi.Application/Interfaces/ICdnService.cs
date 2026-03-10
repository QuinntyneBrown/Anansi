namespace Anansi.Application.Interfaces;

public interface ICdnService
{
    Task<string> GetCdnUrlAsync(string storageKey, CancellationToken ct = default);
    Task<string> GenerateThumbnailAsync(string storageKey, int width, int height, CancellationToken ct = default);
    Task<ProgressiveImageSet> GenerateProgressiveImagesAsync(string storageKey, CancellationToken ct = default);
    Task InvalidateCacheAsync(string storageKey, CancellationToken ct = default);
}

public class ProgressiveImageSet
{
    public string PlaceholderUrl { get; set; } = string.Empty;
    public string LowResUrl { get; set; } = string.Empty;
    public string FullResUrl { get; set; } = string.Empty;
}
