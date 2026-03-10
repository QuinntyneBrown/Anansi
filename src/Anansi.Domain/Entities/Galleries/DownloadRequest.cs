using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Galleries;

public class DownloadRequest : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string? RequestedBy { get; set; }
    public string? RequestedByEmail { get; set; }
    public DownloadResolution Resolution { get; set; }
    public bool IsFullGallery { get; set; }
    public string? MediaIds { get; set; } // Comma-separated GUIDs for individual downloads
    public string? ZipStorageKey { get; set; }
    public bool IsReady { get; set; }
    public DateTime? ReadyAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool NotificationSent { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
}
