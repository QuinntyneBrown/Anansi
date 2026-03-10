using Anansi.Domain.Entities.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Billing;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.BillingInterval).HasConversion<string>().HasMaxLength(50);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(s => s.StripeSubscriptionId).HasMaxLength(256);

        builder.HasIndex(s => s.PhotographerId);
        builder.HasIndex(s => s.PlanId);

        builder.HasOne(s => s.Plan)
            .WithMany()
            .HasForeignKey(s => s.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
