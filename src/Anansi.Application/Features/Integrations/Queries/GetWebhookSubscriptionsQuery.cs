using Anansi.Application.Common;
using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Integrations.Queries;

public record GetWebhookSubscriptionsQuery : IRequest<Result<IReadOnlyList<WebhookSubscriptionDto>>>;

public record WebhookSubscriptionDto(
    Guid Id,
    string Url,
    WebhookEventType EventType,
    bool IsActive,
    DateTime CreatedAt);
