using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record PageElementDto(
    Guid Id,
    Guid PageId,
    ElementType ElementType,
    string? ContentJson,
    double PositionX,
    double PositionY,
    double Width,
    double Height,
    int ZIndex,
    int SortOrder,
    Guid? ParentElementId,
    List<BreakpointOverrideDto> BreakpointOverrides,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record BreakpointOverrideDto(
    Guid Id,
    Breakpoint Breakpoint,
    double? PositionX,
    double? PositionY,
    double? Width,
    double? Height,
    bool IsHidden,
    string? StyleOverridesJson);
