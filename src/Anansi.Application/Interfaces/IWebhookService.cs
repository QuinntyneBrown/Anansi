using Anansi.Domain.Enums;

namespace Anansi.Application.Interfaces;

public interface IWebhookService
{
    Task DeliverAsync(Guid photographerId, WebhookEventType eventType, object payload, CancellationToken ct = default);
}
