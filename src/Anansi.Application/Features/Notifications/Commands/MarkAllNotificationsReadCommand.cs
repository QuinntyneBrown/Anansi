using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Notifications.Commands;

public record MarkAllNotificationsReadCommand : IRequest<Result>;
