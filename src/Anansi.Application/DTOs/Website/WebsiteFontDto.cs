namespace Anansi.Application.DTOs.Website;

public record WebsiteFontDto(
    Guid Id,
    string FontFamily,
    string FileUrl,
    string FileFormat,
    string? FontWeight,
    string? FontStyle);
