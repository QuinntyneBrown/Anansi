using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Email;

/// <summary>
/// File attachment on an email message (EML-5.1.2).
/// Max 25MB per message, 30+ file types supported.
/// </summary>
public class EmailAttachment : BaseEntity
{
    public Guid MessageId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;

    /// <summary>File size in bytes.</summary>
    public long FileSizeBytes { get; set; }

    /// <summary>Storage URL or blob key.</summary>
    public string StorageUrl { get; set; } = string.Empty;

    // Navigation
    public EmailMessage Message { get; set; } = null!;
}
