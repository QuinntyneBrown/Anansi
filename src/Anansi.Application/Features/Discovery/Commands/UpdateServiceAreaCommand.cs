using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Discovery.Commands;

public record UpdateServiceAreaCommand(
    string Neighborhood,
    double Latitude,
    double Longitude,
    int RadiusKm) : IRequest<Result>;

public class UpdateServiceAreaCommandValidator : AbstractValidator<UpdateServiceAreaCommand>
{
    public UpdateServiceAreaCommandValidator()
    {
        RuleFor(x => x.Neighborhood).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
        RuleFor(x => x.RadiusKm).InclusiveBetween(5, 100);
    }
}
