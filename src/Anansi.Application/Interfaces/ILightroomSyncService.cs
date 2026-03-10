namespace Anansi.Application.Interfaces;

public interface ILightroomSyncService
{
    Task<LightroomPublishResult> PublishCollectionAsync(Guid photographerId, string lightroomCollectionId, IEnumerable<LightroomImage> images, CancellationToken ct = default);
    Task<LightroomSyncResult> SyncStructureAsync(Guid photographerId, IEnumerable<LightroomCollectionInfo> collections, CancellationToken ct = default);
    Task<IReadOnlyList<LightroomFavoriteList>> GetFavoriteListsAsync(Guid photographerId, Guid collectionId, CancellationToken ct = default);
}

public class LightroomImage
{
    public string LightroomId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public Stream? ImageStream { get; set; }
    public bool IsUpdate { get; set; }
}

public class LightroomPublishResult
{
    public int ImagesUploaded { get; set; }
    public int ImagesUpdated { get; set; }
    public IReadOnlyList<string> FailedImages { get; set; } = [];
}

public class LightroomCollectionInfo
{
    public string LightroomId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentId { get; set; }
}

public class LightroomSyncResult
{
    public int CollectionsSynced { get; set; }
    public int SetsSynced { get; set; }
}

public class LightroomFavoriteList
{
    public Guid FavoriteListId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PhotoCount { get; set; }
}
