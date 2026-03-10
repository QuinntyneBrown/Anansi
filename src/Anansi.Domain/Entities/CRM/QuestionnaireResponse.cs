using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// A completed response to a questionnaire (QST-4.7.3).
/// </summary>
public class QuestionnaireResponse : BaseEntity
{
    public Guid QuestionnaireId { get; set; }
    public Guid? ContactId { get; set; }
    public string? RespondentEmail { get; set; }
    public string? RespondentName { get; set; }

    /// <summary>JSON serialized answers [{questionId, answer}].</summary>
    public string AnswersJson { get; set; } = "[]";

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Questionnaire Questionnaire { get; set; } = null!;
}
