using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Discovery.Queries;

public record GetCulturalTagsQuery : IRequest<Result<List<string>>>;
