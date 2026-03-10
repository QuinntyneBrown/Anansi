using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.ClientName).HasMaxLength(256).IsRequired();
        builder.Property(o => o.ClientEmail).HasMaxLength(256).IsRequired();
        builder.Property(o => o.ClientPhone).HasMaxLength(50);
        builder.Property(o => o.ShippingAddress).HasMaxLength(500);
        builder.Property(o => o.ShippingCity).HasMaxLength(100);
        builder.Property(o => o.ShippingProvince).HasMaxLength(100);
        builder.Property(o => o.ShippingPostalCode).HasMaxLength(20);
        builder.Property(o => o.ShippingCountry).HasMaxLength(100);
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(o => o.PaymentMethod).HasConversion<string>().HasMaxLength(50);
        builder.Property(o => o.FulfillmentType).HasConversion<string>().HasMaxLength(50);
        builder.Property(o => o.LabPartner).HasConversion<string>().HasMaxLength(50);
        builder.Property(o => o.PaymentIntentId).HasMaxLength(256);
        builder.Property(o => o.CouponCode).HasMaxLength(50);
        builder.Property(o => o.GiftCardCode).HasMaxLength(50);
        builder.Property(o => o.TrackingNumber).HasMaxLength(256);
        builder.Property(o => o.TrackingUrl).HasMaxLength(2048);
        builder.Property(o => o.LabOrderReference).HasMaxLength(256);
        builder.Property(o => o.CommissionPercentage).HasPrecision(5, 2);

        builder.HasIndex(o => o.PhotographerId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.ClientEmail);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.ShippingMethodNavigation)
            .WithMany()
            .HasForeignKey(o => o.ShippingMethodId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
