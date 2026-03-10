using Anansi.Application.Common;
using Anansi.Application.DTOs.Branding;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Branding.Identity;

/// <summary>
/// BRD-7.1.1 Profile Icon, BRD-7.1.2 Logo Upload, BRD-7.1.3 Collection Cover Logo,
/// BRD-7.1.4 Custom Favicon, BRD-7.1.5 Platform Branding Removal.
/// </summary>
public record GetBrandingProfileQuery : IRequest<Result<BrandingProfileDto>>;

public class GetBrandingProfileHandler : IRequestHandler<GetBrandingProfileQuery, Result<BrandingProfileDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetBrandingProfileHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BrandingProfileDto>> Handle(GetBrandingProfileQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BrandingProfileDto>.Failure("Not authenticated", 401);

        var photographer = await _db.Set<Domain.Entities.Photographer>()
            .FirstOrDefaultAsync(p => p.Id == photographerId.Value, ct);

        if (photographer is null)
            return Result<BrandingProfileDto>.NotFound("Photographer not found");

        // BRD-7.1.3: cover logo is auto-generated white version (URL convention)
        var coverLogoUrl = photographer.LogoUrl != null
            ? photographer.LogoUrl.Replace("/logos/", "/logos/cover-")
            : null;

        // BRD-7.1.5: branding removal based on plan (simplified - check if on paid plan)
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
