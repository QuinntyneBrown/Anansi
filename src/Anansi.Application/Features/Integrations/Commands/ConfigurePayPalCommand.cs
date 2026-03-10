using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigurePayPalCommand(string PayPalEmail) : IRequest<Result>;

public class ConfigurePayPalCommandValidator : AbstractValidator<ConfigurePayPalCommand>
{
    public ConfigurePayPalCommandValidator()
    {
        RuleFor(x => x.PayPalEmail).NotEmpty().EmailAddress();
    }
}
