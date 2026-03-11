using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubLightroomSyncService : ILightroomSyncService
{
    private readonly ILogger<StubLightroomSyncService> _logger;

    public StubLightroomSyncService(ILogger<StubLightroomSyncService> logger)
    {
        _logger = logger;
    }

    public Task<LightroomPublishResult> PublishCollectionAsync(Guid photographerId, string lightroomCollectionId, IEnumerable<LightroomImage> images, CancellationToken ct = default)
    {
        _logger.LogInformation("Lightroom publish for photographer {Id}", photographerId);
        return Task.FromResult(new LightroomPublishResult());
    }

    public Task<LightroomSyncResult> SyncStructureAsync(Guid photographerId, IEnumerable<LightroomCollectionInfo> collections, CancellationToken ct = default)
    {
        _logger.LogInformation("Lightroom sync for photographer {Id}", photographerId);
        return Task.FromResult(new LightroomSyncResult());
    }

    public Task<IReadOnlyList<LightroomFavoriteList>> GetFavoriteListsAsync(Guid photographerId, Guid collectionId, CancellationToken ct = default)
    {
        _logger.LogInformation("Lightroom favorites for collection {Id}", collectionId);
        return Task.FromResult<IReadOnlyList<LightroomFavoriteList>>(Array.Empty<LightroomFavoriteList>());
    }
}
