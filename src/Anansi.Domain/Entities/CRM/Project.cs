using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Kanban project card (CRM-4.2.1, CRM-4.2.2, CRM-4.2.3).
/// </summary>
public class Project : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid StageId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? ProjectType { get; set; }

    /// <summary>Sort position within its stage column.</summary>
    public int SortOrder { get; set; }

    // Navigation
    public Contact? Contact { get; set; }
    public ProjectStage Stage { get; set; } = null!;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
