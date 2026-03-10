using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Account.Commands;

public class UpdateAccountSettingsCommandHandler : IRequestHandler<UpdateAccountSettingsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateAccountSettingsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateAccountSettingsCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result.NotFound("Photographer not found.");

        if (request.FirstName != null) photographer.FirstName = request.FirstName;
        if (request.LastName != null) photographer.LastName = request.LastName;
        if (request.BusinessName != null) photographer.BusinessName = request.BusinessName;
        if (request.Phone != null) photographer.Phone = request.Phone;
        if (request.Address != null) photographer.Address = request.Address;
        if (request.City != null) photographer.City = request.City;
        if (request.Province != null) photographer.Province = request.Province;
        if (request.PostalCode != null) photographer.PostalCode = request.PostalCode;
        if (request.Country != null) photographer.Country = request.Country;
        if (request.Website != null) photographer.Website = request.Website;
        if (request.LogoUrl != null) photographer.LogoUrl = request.LogoUrl;
        if (request.ProfileIconUrl != null) photographer.ProfileIconUrl = request.ProfileIconUrl;
        if (request.FaviconUrl != null) photographer.FaviconUrl = request.FaviconUrl;
        if (request.BrandColorHex != null) photographer.BrandColorHex = request.BrandColorHex;
        if (request.FontTheme != null) photographer.FontTheme = request.FontTheme;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
