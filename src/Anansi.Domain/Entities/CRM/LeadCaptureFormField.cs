using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Custom field on a lead capture form (CRM-4.1.5).
/// </summary>
public class LeadCaptureFormField : BaseEntity
{
    public Guid FormId { get; set; }
    public string Label { get; set; } = string.Empty;
    public QuestionType FieldType { get; set; }
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }

    /// <summary>JSON options for MultipleChoice / Checkboxes.</summary>
    public string? Options { get; set; }

    // Navigation
    public LeadCaptureForm Form { get; set; } = null!;
}
