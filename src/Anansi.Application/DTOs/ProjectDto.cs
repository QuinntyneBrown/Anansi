namespace Anansi.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string? ProjectType,
    Guid StageId,
    string StageName,
    Guid? ContactId,
    string? ContactName,
    int SortOrder,
    DateTime CreatedAt);
