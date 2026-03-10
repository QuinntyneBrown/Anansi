using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Account.Commands;

public record UpdateAccountSettingsCommand(
    string? FirstName,
    string? LastName,
    string? BusinessName,
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
    string? FontTheme) : IRequest<Result>;

public class UpdateAccountSettingsCommandValidator : AbstractValidator<UpdateAccountSettingsCommand>
{
    public UpdateAccountSettingsCommandValidator()
    {
        RuleFor(x => x.FirstName).MaximumLength(100).When(x => x.FirstName != null);
        RuleFor(x => x.LastName).MaximumLength(100).When(x => x.LastName != null);
        RuleFor(x => x.BusinessName).MaximumLength(256).When(x => x.BusinessName != null);
        RuleFor(x => x.Phone).MaximumLength(20).When(x => x.Phone != null);
        RuleFor(x => x.BrandColorHex).Matches(@"^#[0-9A-Fa-f]{6}$").When(x => x.BrandColorHex != null);
    }
}
