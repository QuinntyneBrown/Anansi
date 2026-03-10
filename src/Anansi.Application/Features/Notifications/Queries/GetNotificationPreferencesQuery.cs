using Anansi.Application.Common;
using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Notifications.Queries;

public record GetNotificationPreferencesQuery : IRequest<Result<IReadOnlyList<NotificationPreferenceDto>>>;

public record NotificationPreferenceDto(
    Guid Id,
    NotificationEventType EventType,
    bool EmailEnabled,
    bool PushEnabled,
    bool InAppEnabled,
    EmailDigestOption EmailDigestOption);
