namespace Anansi.Application.DTOs.Website;

public record ColorPaletteDto(
    Guid Id,
    string Name,
    string ColorsJson,
    bool IsSystem,
    int SortOrder);
