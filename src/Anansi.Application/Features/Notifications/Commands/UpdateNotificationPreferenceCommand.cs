using Anansi.Application.Common;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Notifications.Commands;

public record UpdateNotificationPreferenceCommand(
    NotificationEventType EventType,
    bool EmailEnabled,
    bool PushEnabled,
    bool InAppEnabled,
    EmailDigestOption EmailDigestOption) : IRequest<Result>;

public class UpdateNotificationPreferenceCommandValidator : AbstractValidator<UpdateNotificationPreferenceCommand>
{
    public UpdateNotificationPreferenceCommandValidator()
    {
        RuleFor(x => x.EventType).IsInEnum();
        RuleFor(x => x.EmailDigestOption).IsInEnum();
    }
}
