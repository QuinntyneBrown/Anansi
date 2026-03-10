using Anansi.Application.Common;
using Anansi.Application.DTOs.Branding;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Branding.Identity;

/// <summary>
/// BRD-7.1.1 Profile Icon, BRD-7.1.2 Logo Upload (PNG, up to 5MB),
/// BRD-7.1.4 Custom Favicon.
/// </summary>
public record UpdateBrandingProfileCommand(
    string? ProfileIconUrl,
    string? LogoUrl,
    string? FaviconUrl,
    string? BrandColorHex,
    string? FontTheme) : IRequest<Result<BrandingProfileDto>>;

public class UpdateBrandingProfileValidator : AbstractValidator<UpdateBrandingProfileCommand>
{
    public UpdateBrandingProfileValidator()
    {
        RuleFor(x => x.BrandColorHex)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .When(x => x.BrandColorHex != null)
            .WithMessage("Brand color must be a valid hex color code");
    }
}

public class UpdateBrandingProfileHandler : IRequestHandler<UpdateBrandingProfileCommand, Result<BrandingProfileDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateBrandingProfileHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BrandingProfileDto>> Handle(UpdateBrandingProfileCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BrandingProfileDto>.Failure("Not authenticated", 401);

        var photographer = await _db.Set<Domain.Entities.Photographer>()
            .FirstOrDefaultAsync(p => p.Id == photographerId.Value, ct);

        if (photographer is null)
            return Result<BrandingProfileDto>.NotFound("Photographer not found");

        if (request.ProfileIconUrl != null) photographer.ProfileIconUrl = request.ProfileIconUrl;
        if (request.LogoUrl != null) photographer.LogoUrl = request.LogoUrl;
        if (request.FaviconUrl != null) photographer.FaviconUrl = request.FaviconUrl;
        if (request.BrandColorHex != null) photographer.BrandColorHex = request.BrandColorHex;
        if (request.FontTheme != null) photographer.FontTheme = request.FontTheme;

        await _db.SaveChangesAsync(ct);

        var coverLogoUrl = photographer.LogoUrl != null
            ? photographer.LogoUrl.Replace("/logos/", "/logos/cover-")
            : null;

        var platformBrandingRemoved = photographer.ActivePlanId.HasValue;

        return Result<BrandingProfileDto>.Success(new BrandingProfileDto(
            photographer.Id,
            photographer.ProfileIconUrl,
            photographer.LogoUrl,
            coverLogoUrl,
            photographer.FaviconUrl,
            photographer.BrandColorHex,
            photographer.FontTheme,
            platformBrandingRemoved));
    }
}
