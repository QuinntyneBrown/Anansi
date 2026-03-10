using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Account.Queries;

public record GetAccountSettingsQuery : IRequest<Result<AccountSettingsDto>>;

public record AccountSettingsDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string BusinessName,
    string? Phone,
    string? Address,
    string? City,
    string? Province,
    string? PostalCode,
    string? Country,
    string? Website,
    string? LogoUrl,
    string? ProfileIconUrl,
    string? FaviconUrl,
    string? BrandColorHex,
    string? FontTheme,
    string? StripeAccountId,
    string? PayPalEmail,
    string? GoogleCalendarId,
    string? ZoomAccountId,
    string? GoogleAnalyticsId,
    string? FacebookPixelId,
    bool InstagramConnected,
    long StorageUsedBytes);
