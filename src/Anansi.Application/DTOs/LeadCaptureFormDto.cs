using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record LeadCaptureFormDto(
    Guid Id,
    string Name,
    string? Description,
    ContactType DefaultContactType,
    string Slug,
    string? EmbedCode,
    bool IsActive,
    IReadOnlyList<LeadCaptureFormFieldDto> Fields,
    DateTime CreatedAt);

public record LeadCaptureFormFieldDto(
    Guid Id,
    string Label,
    QuestionType FieldType,
    bool IsRequired,
    int SortOrder,
    string? Options);

public record LeadCaptureFormSubmissionDto(
    Guid Id,
    Guid FormId,
    Guid? ContactId,
    string? SubmitterEmail,
    string? SubmitterFirstName,
    string? SubmitterLastName,
    string? Message,
    string ResponseData,
    DateTime CreatedAt);
