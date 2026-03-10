using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record QuestionnaireDto(
    Guid Id,
    string Title,
    string? Description,
    Guid? ContactId,
    string? ContactName,
    QuestionnaireStatus Status,
    DateTime? SentAt,
    DateTime? CompletedAt,
    bool AllowMultipleSubmissions,
    string? PublicSlug,
    int? ExpiryDays,
    DateTime? ExpiresAt,
    bool AutoRemindersEnabled,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<QuestionnaireQuestionDto> Questions,
    DateTime CreatedAt);

public record QuestionnaireQuestionDto(
    Guid Id,
    string Label,
    QuestionType QuestionType,
    bool IsRequired,
    int SortOrder,
    string? Options);

public record QuestionnaireResponseDto(
    Guid Id,
    Guid QuestionnaireId,
    Guid? ContactId,
    string? RespondentEmail,
    string? RespondentName,
    string AnswersJson,
    DateTime SubmittedAt);
