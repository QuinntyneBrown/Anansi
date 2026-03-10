using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigureFacebookPixelCommand(string PixelId) : IRequest<Result>;

public class ConfigureFacebookPixelCommandValidator : AbstractValidator<ConfigureFacebookPixelCommand>
{
    public ConfigureFacebookPixelCommandValidator()
    {
        RuleFor(x => x.PixelId).NotEmpty().MaximumLength(50)
            .Matches(@"^\d+$").WithMessage("Must be a valid Facebook Pixel ID (numeric).");
    }
}
