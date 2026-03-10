using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Discovery.Queries;

public record ListAvailableCulturalTagsQuery : IRequest<Result<List<AvailableTagDto>>>;

public record AvailableTagDto(string Name, int UsageCount, bool IsSystem);
