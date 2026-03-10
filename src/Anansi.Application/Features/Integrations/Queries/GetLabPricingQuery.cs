using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Integrations.Queries;

public record GetLabPricingQuery(string LabName) : IRequest<Result<IReadOnlyList<LabProductDto>>>;

public record LabProductDto(
    Guid Id,
    string LabName,
    string ProductName,
    string Category,
    string Size,
    long LabCostCents,
    DateTime PriceLastUpdated);
