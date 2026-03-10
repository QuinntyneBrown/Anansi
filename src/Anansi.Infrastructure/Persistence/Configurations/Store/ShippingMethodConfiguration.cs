using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class ShippingMethodConfiguration : IEntityTypeConfiguration<ShippingMethod>
{
    public void Configure(EntityTypeBuilder<ShippingMethod> builder)
    {
        builder.ToTable("ShippingMethods");
        builder.HasKey(sm => sm.Id);
        builder.Property(sm => sm.Name).HasMaxLength(256).IsRequired();
        builder.Property(sm => sm.Description).HasMaxLength(500);
        builder.Property(sm => sm.EstimatedDelivery).HasMaxLength(100);

        builder.HasIndex(sm => sm.PhotographerId);
    }
}
