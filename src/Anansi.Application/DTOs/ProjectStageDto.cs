namespace Anansi.Application.DTOs;

public record ProjectStageDto(
    Guid Id,
    string Name,
    int SortOrder,
    IReadOnlyList<ProjectDto> Projects);
