using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record DeleteWebhookSubscriptionCommand(Guid Id) : IRequest<Result>;

public class DeleteWebhookSubscriptionCommandValidator : AbstractValidator<DeleteWebhookSubscriptionCommand>
{
    public DeleteWebhookSubscriptionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
