using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigureGoogleAnalyticsCommand(string MeasurementId) : IRequest<Result>;

public class ConfigureGoogleAnalyticsCommandValidator : AbstractValidator<ConfigureGoogleAnalyticsCommand>
{
    public ConfigureGoogleAnalyticsCommandValidator()
    {
        RuleFor(x => x.MeasurementId).NotEmpty().MaximumLength(50)
            .Matches(@"^G-[A-Z0-9]+$").WithMessage("Must be a valid GA4 Measurement ID (e.g., G-XXXXXXXXXX).");
    }
}
