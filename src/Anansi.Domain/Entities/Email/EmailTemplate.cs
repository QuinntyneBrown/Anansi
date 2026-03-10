using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Email;

/// <summary>
/// Reusable email template (EML-5.2.1, EML-5.2.2, EML-5.2.3).
/// </summary>
public class EmailTemplate : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>"Gallery", "StudioManager", "BrandedInvite" (EML-5.2.1, EML-5.2.2, EML-5.2.3).</summary>
    public string Category { get; set; } = "StudioManager";

    public string? SubjectLine { get; set; }
    public string Body { get; set; } = string.Empty;
    public string? HtmlBody { get; set; }

    /// <summary>Header image URL for branded invites (EML-5.2.3).</summary>
    public string? HeaderImageUrl { get; set; }

    /// <summary>Whether to use photographer's branding (EML-5.2.3).</summary>
    public bool UseBranding { get; set; } = true;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
