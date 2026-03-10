using Anansi.Application.Features.Notifications.Commands;
using MediatR;

namespace Anansi.Application.Features.Notifications.Events;

public class NotificationEventHandler : INotificationHandler<NotificationEvent>
{
    private readonly IMediator _mediator;

    public NotificationEventHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task Handle(NotificationEvent notification, CancellationToken cancellationToken)
    {
        await _mediator.Send(new CreateNotificationCommand(
            notification.PhotographerId,
            notification.EventType,
            notification.Category,
            notification.Title,
            notification.Message,
            notification.ClientName,
            notification.Link), cancellationToken);
    }
}
