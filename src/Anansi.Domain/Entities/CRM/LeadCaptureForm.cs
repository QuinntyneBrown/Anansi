using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Embeddable lead capture / contact form (CRM-4.1.5).
/// </summary>
public class LeadCaptureForm : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ContactType DefaultContactType { get; set; } = ContactType.Lead;

    /// <summary>Unique shareable slug for direct link.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Embed code snippet (auto-generated).</summary>
    public string? EmbedCode { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<LeadCaptureFormField> Fields { get; set; } = new List<LeadCaptureFormField>();
    public ICollection<LeadCaptureFormSubmission> Submissions { get; set; } = new List<LeadCaptureFormSubmission>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
