using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Kanban board stage / column (CRM-4.2.1).
/// Default: Inquiry, Booked Session, Post-production, Completed Project.
/// </summary>
public class ProjectStage : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
