using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class WebhookDeliveryConfiguration : IEntityTypeConfiguration<WebhookDelivery>
{
    public void Configure(EntityTypeBuilder<WebhookDelivery> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Payload).IsRequired();
        builder.Property(d => d.ResponseBody).HasMaxLength(4000);

        builder.HasIndex(d => d.WebhookSubscriptionId);

        builder.HasOne(d => d.WebhookSubscription)
            .WithMany()
            .HasForeignKey(d => d.WebhookSubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
