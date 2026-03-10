using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class LabOrderConfiguration : IEntityTypeConfiguration<LabOrder>
{
    public void Configure(EntityTypeBuilder<LabOrder> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.LabName).IsRequired().HasMaxLength(256);
        builder.Property(l => l.ExternalLabOrderId).HasMaxLength(256);
        builder.Property(l => l.ImageFileKey).IsRequired().HasMaxLength(1024);
        builder.Property(l => l.ProductSpecifications).IsRequired().HasMaxLength(2000);
        builder.Property(l => l.Size).IsRequired().HasMaxLength(100);
        builder.Property(l => l.ShippingName).IsRequired().HasMaxLength(256);
        builder.Property(l => l.ShippingAddress).IsRequired().HasMaxLength(512);
        builder.Property(l => l.ShippingCity).IsRequired().HasMaxLength(256);
        builder.Property(l => l.ShippingProvince).IsRequired().HasMaxLength(256);
        builder.Property(l => l.ShippingPostalCode).IsRequired().HasMaxLength(20);
        builder.Property(l => l.ShippingCountry).IsRequired().HasMaxLength(100);
        builder.Property(l => l.TrackingNumber).HasMaxLength(256);

        builder.HasIndex(l => l.PhotographerId);
        builder.HasIndex(l => l.StoreOrderId);
        builder.HasIndex(l => l.Status);
    }
}
