using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class ProductVariationConfiguration : IEntityTypeConfiguration<ProductVariation>
{
    public void Configure(EntityTypeBuilder<ProductVariation> builder)
    {
        builder.ToTable("ProductVariations");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(256).IsRequired();
        builder.Property(v => v.Sku).HasMaxLength(100);

        builder.HasIndex(v => v.ProductId);
    }
}
