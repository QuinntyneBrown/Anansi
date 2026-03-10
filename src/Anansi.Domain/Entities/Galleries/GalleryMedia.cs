using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Galleries;

public class GalleryMedia : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public Guid? SetId { get; set; }

    // File info
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string? ThumbnailStorageKey { get; set; }

    // Image metadata
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? CameraMake { get; set; }
    public string? CameraModel { get; set; }
    public string? LensModel { get; set; }
    public double? FocalLength { get; set; }
    public string? Aperture { get; set; }
    public string? ShutterSpeed { get; set; }
    public int? Iso { get; set; }
    public DateTime? DateTaken { get; set; }
    public double? GpsLatitude { get; set; }
    public double? GpsLongitude { get; set; }

    // Video metadata (GAL-1.1.5)
    public TimeSpan? Duration { get; set; }
    public string? VideoResolution { get; set; }
    public string? CustomVideoThumbnailKey { get; set; }

    // Organization
    public int SortOrder { get; set; }
    public bool IsStarred { get; set; }
    public bool IsPrivate { get; set; }
    public Guid? MarkedPrivateByClientId { get; set; }

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
    public CollectionSet? Set { get; set; }
}
