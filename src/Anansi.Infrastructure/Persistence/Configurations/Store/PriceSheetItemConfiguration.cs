using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class PriceSheetItemConfiguration : IEntityTypeConfiguration<PriceSheetItem>
{
    public void Configure(EntityTypeBuilder<PriceSheetItem> builder)
    {
        builder.ToTable("PriceSheetItems");
        builder.HasKey(i => i.Id);

        builder.HasOne(i => i.ProductVariation)
            .WithMany()
            .HasForeignKey(i => i.ProductVariationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => new { i.PriceSheetId, i.ProductVariationId }).IsUnique();
    }
}
