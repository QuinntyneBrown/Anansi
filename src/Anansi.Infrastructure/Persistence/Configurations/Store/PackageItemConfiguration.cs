using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class PackageItemConfiguration : IEntityTypeConfiguration<PackageItem>
{
    public void Configure(EntityTypeBuilder<PackageItem> builder)
    {
        builder.ToTable("PackageItems");
        builder.HasKey(pi => pi.Id);

        builder.HasOne(pi => pi.IncludedProduct)
            .WithMany()
            .HasForeignKey(pi => pi.IncludedProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pi => pi.IncludedVariation)
            .WithMany()
            .HasForeignKey(pi => pi.IncludedVariationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
