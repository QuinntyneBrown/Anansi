using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Integrations;

public class WebhookDelivery : BaseEntity
{
    public Guid WebhookSubscriptionId { get; set; }
    public string Payload { get; set; } = string.Empty;
    public int HttpStatusCode { get; set; }
    public string? ResponseBody { get; set; }
    public bool Success { get; set; }
    public DateTime DeliveredAt { get; set; } = DateTime.UtcNow;

    public WebhookSubscription? WebhookSubscription { get; set; }
}
