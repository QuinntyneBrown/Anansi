using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.ProductName).HasMaxLength(256).IsRequired();
        builder.Property(oi => oi.VariationName).HasMaxLength(256);
        builder.Property(oi => oi.SelectedPhotoUrl).HasMaxLength(2048);

        builder.HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(oi => oi.ProductVariation)
            .WithMany()
            .HasForeignKey(oi => oi.ProductVariationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
