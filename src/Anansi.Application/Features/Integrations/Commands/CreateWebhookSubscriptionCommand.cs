using Anansi.Application.Common;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record CreateWebhookSubscriptionCommand(
    string Url,
    WebhookEventType EventType,
    string? Secret = null) : IRequest<Result<Guid>>;

public class CreateWebhookSubscriptionCommandValidator : AbstractValidator<CreateWebhookSubscriptionCommand>
{
    public CreateWebhookSubscriptionCommandValidator()
    {
        RuleFor(x => x.Url).NotEmpty().MaximumLength(2048)
            .Must(u => Uri.TryCreate(u, UriKind.Absolute, out _)).WithMessage("Must be a valid URL.");
        RuleFor(x => x.EventType).IsInEnum();
    }
}
