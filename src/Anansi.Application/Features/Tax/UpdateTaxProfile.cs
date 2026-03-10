using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Configure the HST tax profile (TAX-21.1.1).
/// </summary>
public record UpdateTaxProfileCommand(
    decimal HstRatePercent,
    string? HstRegistrationNumber,
    HstRegistrationStatus RegistrationStatus,
    bool IsHstEnabled) : IRequest<Result<TaxProfileDto>>;

public class UpdateTaxProfileValidator : AbstractValidator<UpdateTaxProfileCommand>
{
    public UpdateTaxProfileValidator()
    {
        RuleFor(x => x.HstRatePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.HstRegistrationNumber).MaximumLength(50);
    }
}

public class UpdateTaxProfileHandler : IRequestHandler<UpdateTaxProfileCommand, Result<TaxProfileDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateTaxProfileHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxProfileDto>> Handle(UpdateTaxProfileCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var profile = await _db.TaxProfiles
            .FirstOrDefaultAsync(t => t.PhotographerId == photographerId, ct);

        if (profile is null)
        {
            profile = new TaxProfile
            {
                PhotographerId = photographerId
            };
            _db.TaxProfiles.Add(profile);
        }

        profile.HstRatePercent = request.HstRatePercent;
        profile.HstRegistrationNumber = request.HstRegistrationNumber;
        profile.RegistrationStatus = request.RegistrationStatus;
        profile.IsHstEnabled = request.IsHstEnabled;

        await _db.SaveChangesAsync(ct);

        return Result<TaxProfileDto>.Success(MapToDto(profile));
    }

    internal static TaxProfileDto MapToDto(TaxProfile p) =>
        new(p.Id, p.HstRatePercent, p.HstRegistrationNumber, p.RegistrationStatus, p.IsHstEnabled);
}
