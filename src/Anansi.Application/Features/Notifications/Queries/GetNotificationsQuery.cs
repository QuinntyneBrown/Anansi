using Anansi.Application.Common;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(
    NotificationCategory? Category,
    bool? IsRead,
    int Page = 1,
    int PageSize = 20) : IRequest<Result<PagedList<NotificationDto>>>;

public record NotificationDto(
    Guid Id,
    NotificationEventType EventType,
    NotificationCategory Category,
    string Title,
    string Message,
    string? ClientName,
    string? Link,
    bool IsRead,
    DateTime? ReadAt,
    DateTime CreatedAt);

public class GetNotificationsQueryValidator : AbstractValidator<GetNotificationsQuery>
{
    public GetNotificationsQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
