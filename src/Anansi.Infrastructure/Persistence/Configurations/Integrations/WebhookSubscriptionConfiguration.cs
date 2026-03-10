using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class WebhookSubscriptionConfiguration : IEntityTypeConfiguration<WebhookSubscription>
{
    public void Configure(EntityTypeBuilder<WebhookSubscription> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Url).IsRequired().HasMaxLength(2048);
        builder.Property(w => w.Secret).HasMaxLength(256);

        builder.HasIndex(w => w.PhotographerId);
        builder.HasIndex(w => new { w.PhotographerId, w.EventType });
    }
}
