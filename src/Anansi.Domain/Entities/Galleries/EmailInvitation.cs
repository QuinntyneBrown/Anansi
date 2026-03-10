using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Galleries;

public class EmailInvitation : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid CollectionId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? HeaderImageUrl { get; set; }
    public bool IncludePassword { get; set; }
    public bool IsSent { get; set; }
    public DateTime? SentAt { get; set; }
    public bool IsOpened { get; set; }
    public DateTime? OpenedAt { get; set; }

    // Navigation
    public Collection Collection { get; set; } = null!;
}
