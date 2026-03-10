using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Account.Queries;

public class GetAccountSettingsQueryHandler : IRequestHandler<GetAccountSettingsQuery, Result<AccountSettingsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetAccountSettingsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<AccountSettingsDto>> Handle(GetAccountSettingsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<AccountSettingsDto>.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result<AccountSettingsDto>.NotFound("Photographer not found.");

        return Result<AccountSettingsDto>.Success(new AccountSettingsDto(
            photographer.Id,
            photographer.Email,
            photographer.FirstName,
            photographer.LastName,
            photographer.BusinessName,
            photographer.Phone,
            photographer.Address,
            photographer.City,
            photographer.Province,
            photographer.PostalCode,
            photographer.Country,
            photographer.Website,
            photographer.LogoUrl,
            photographer.ProfileIconUrl,
            photographer.FaviconUrl,
            photographer.BrandColorHex,
            photographer.FontTheme,
            photographer.StripeAccountId,
            photographer.PayPalEmail,
            photographer.GoogleCalendarId,
            photographer.ZoomAccountId,
            photographer.GoogleAnalyticsId,
            photographer.FacebookPixelId,
            !string.IsNullOrEmpty(photographer.InstagramAccessToken),
            photographer.StorageUsedBytes));
    }
}
