using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubCdnService : ICdnService
{
    private readonly ILogger<StubCdnService> _logger;

    public StubCdnService(ILogger<StubCdnService> logger)
    {
        _logger = logger;
    }

    public Task<string> GetCdnUrlAsync(string storageKey, CancellationToken ct = default)
    {
        return Task.FromResult($"http://localhost:9000/cdn/{storageKey}");
    }

    public Task<string> GenerateThumbnailAsync(string storageKey, int width, int height, CancellationToken ct = default)
    {
        _logger.LogInformation("Thumbnail generated: {Key} ({W}x{H})", storageKey, width, height);
        return Task.FromResult($"http://localhost:9000/cdn/thumb/{width}x{height}/{storageKey}");
    }

    public Task<ProgressiveImageSet> GenerateProgressiveImagesAsync(string storageKey, CancellationToken ct = default)
    {
        _logger.LogInformation("Progressive images generated: {Key}", storageKey);
        return Task.FromResult(new ProgressiveImageSet
        {
            PlaceholderUrl = $"http://localhost:9000/cdn/placeholder/{storageKey}",
            LowResUrl = $"http://localhost:9000/cdn/lowres/{storageKey}",
            FullResUrl = $"http://localhost:9000/cdn/full/{storageKey}"
        });
    }

    public Task InvalidateCacheAsync(string storageKey, CancellationToken ct = default)
    {
        _logger.LogInformation("CDN cache invalidated: {Key}", storageKey);
        return Task.CompletedTask;
    }
}
