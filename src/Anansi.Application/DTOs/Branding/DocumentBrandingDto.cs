using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Branding;

public record DocumentBrandingDto(
    Guid Id,
    DocumentType DocumentType,
    string? HeaderImageUrl,
    string? BrandColorHex,
    string? SecondaryColorHex,
    string? FontTheme);
