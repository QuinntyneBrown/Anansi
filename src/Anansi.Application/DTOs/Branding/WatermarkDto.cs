using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Branding;

public record WatermarkDto(
    Guid Id,
    string Name,
    WatermarkType Type,
    string? Text,
    string? FontFamily,
    string? ImageUrl,
    double Opacity,
    double Scale,
    WatermarkPosition Position,
    bool IsDefault,
    DateTime CreatedAt);
