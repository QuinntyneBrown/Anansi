using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(256).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.ProductType).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.FulfillmentType).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.LabPartner).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.PreviewImageUrl).HasMaxLength(2048);
        builder.Property(p => p.DigitalResolutionOptions).HasMaxLength(1000);

        builder.HasIndex(p => p.PhotographerId);
        builder.HasIndex(p => new { p.PhotographerId, p.ProductType });

        builder.HasMany(p => p.Variations)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PackageItems)
            .WithOne(pi => pi.PackageProduct)
            .HasForeignKey(pi => pi.PackageProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
