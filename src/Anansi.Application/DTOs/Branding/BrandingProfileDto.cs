namespace Anansi.Application.DTOs.Branding;

/// <summary>
/// BRD-7.1.1 through BRD-7.1.5 - Consolidated branding profile.
/// </summary>
public record BrandingProfileDto(
    Guid PhotographerId,
    string? ProfileIconUrl,
    string? LogoUrl,
    string? CoverLogoUrl,
    string? FaviconUrl,
    string? BrandColorHex,
    string? FontTheme,
    bool PlatformBrandingRemoved);
