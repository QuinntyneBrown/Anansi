using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Notifications.Queries;

public record GetUnreadCountQuery : IRequest<Result<int>>;
