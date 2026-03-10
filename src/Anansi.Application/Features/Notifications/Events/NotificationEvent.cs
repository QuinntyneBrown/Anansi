using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Notifications.Events;

public record NotificationEvent(
    Guid PhotographerId,
    NotificationEventType EventType,
    NotificationCategory Category,
    string Title,
    string Message,
    string? ClientName = null,
    string? Link = null) : INotification;
