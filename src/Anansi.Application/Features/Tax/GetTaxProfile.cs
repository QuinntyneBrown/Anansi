using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Retrieve the HST tax profile (TAX-21.1.2).
/// </summary>
public record GetTaxProfileQuery : IRequest<Result<TaxProfileDto>>;

public class GetTaxProfileHandler : IRequestHandler<GetTaxProfileQuery, Result<TaxProfileDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTaxProfileHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxProfileDto>> Handle(GetTaxProfileQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var profile = await _db.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.PhotographerId == photographerId, ct);

        if (profile is null)
        {
            // Return defaults when no profile has been configured yet
            return Result<TaxProfileDto>.Success(
                new TaxProfileDto(Guid.Empty, 13m, null, HstRegistrationStatus.NotRegistered, false));
        }

        return Result<TaxProfileDto>.Success(
            new TaxProfileDto(profile.Id, profile.HstRatePercent, profile.HstRegistrationNumber,
                profile.RegistrationStatus, profile.IsHstEnabled));
    }
}
