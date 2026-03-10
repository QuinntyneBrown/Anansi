using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class PriceSheetConfiguration : IEntityTypeConfiguration<PriceSheet>
{
    public void Configure(EntityTypeBuilder<PriceSheet> builder)
    {
        builder.ToTable("PriceSheets");
        builder.HasKey(ps => ps.Id);
        builder.Property(ps => ps.Name).HasMaxLength(256).IsRequired();
        builder.Property(ps => ps.Description).HasMaxLength(1000);

        builder.HasIndex(ps => ps.PhotographerId);

        builder.HasMany(ps => ps.Items)
            .WithOne(i => i.PriceSheet)
            .HasForeignKey(i => i.PriceSheetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
