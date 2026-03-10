using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Question within a questionnaire (QST-4.7.1).
/// </summary>
public class QuestionnaireQuestion : BaseEntity
{
    public Guid QuestionnaireId { get; set; }
    public string Label { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }

    /// <summary>JSON options for MultipleChoice / Checkboxes.</summary>
    public string? Options { get; set; }

    // Navigation
    public Questionnaire Questionnaire { get; set; } = null!;
}
