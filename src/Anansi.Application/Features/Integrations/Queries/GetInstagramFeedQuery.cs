using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;

namespace Anansi.Application.Features.Integrations.Queries;

public record GetInstagramFeedQuery(Guid PhotographerId) : IRequest<Result<IReadOnlyList<InstagramPost>>>;
