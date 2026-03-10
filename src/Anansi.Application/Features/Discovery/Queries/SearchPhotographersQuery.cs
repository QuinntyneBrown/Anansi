using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Discovery.Queries;

public record SearchPhotographersQuery(
    List<string>? Tags,
    string? Neighborhood,
    int Page = 1) : IRequest<Result<SearchPhotographersResult>>;

public record SearchPhotographersResult(
    List<SearchPhotographerDto> Items,
    int TotalCount,
    int Page,
    int PageSize);

public record SearchPhotographerDto(
    Guid Id,
    string FirstName,
    string LastName,
    string BusinessName,
    string? ProfileImageUrl,
    List<string> Tags,
    string? Neighborhood,
    double? DistanceKm,
    double RelevanceScore);

public class SearchPhotographersQueryValidator : AbstractValidator<SearchPhotographersQuery>
{
    public SearchPhotographersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x)
            .Must(x => (x.Tags != null && x.Tags.Count > 0) || !string.IsNullOrEmpty(x.Neighborhood))
            .WithMessage("At least one search criteria (tags or neighborhood) is required.");
    }
}
