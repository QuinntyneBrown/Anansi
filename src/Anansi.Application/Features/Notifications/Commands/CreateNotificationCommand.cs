using Anansi.Application.Common;
using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Notifications.Commands;

public record CreateNotificationCommand(
    Guid PhotographerId,
    NotificationEventType EventType,
    NotificationCategory Category,
    string Title,
    string Message,
    string? ClientName = null,
    string? Link = null) : IRequest<Result<Guid>>;
