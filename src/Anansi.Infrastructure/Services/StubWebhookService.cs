using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubWebhookService : IWebhookService
{
    private readonly ILogger<StubWebhookService> _logger;

    public StubWebhookService(ILogger<StubWebhookService> logger)
    {
        _logger = logger;
    }

    public Task DeliverAsync(Guid photographerId, WebhookEventType eventType, object payload, CancellationToken ct = default)
    {
        _logger.LogInformation("Webhook delivered: {EventType} for photographer {Id}", eventType, photographerId);
        return Task.CompletedTask;
    }
}
