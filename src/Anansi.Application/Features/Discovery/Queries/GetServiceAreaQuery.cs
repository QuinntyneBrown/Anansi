using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Discovery.Queries;

public record GetServiceAreaQuery : IRequest<Result<ServiceAreaDto?>>;

public record ServiceAreaDto(
    string Neighborhood,
    double Latitude,
    double Longitude,
    int RadiusKm);
