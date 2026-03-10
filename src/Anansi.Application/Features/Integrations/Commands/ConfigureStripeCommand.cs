using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigureStripeCommand(string Email, string Country) : IRequest<Result<string>>;

public class ConfigureStripeCommandValidator : AbstractValidator<ConfigureStripeCommand>
{
    public ConfigureStripeCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Country).NotEmpty().MaximumLength(2);
    }
}
