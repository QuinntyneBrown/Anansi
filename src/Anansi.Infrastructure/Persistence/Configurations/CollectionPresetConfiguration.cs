using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class CollectionPresetConfiguration : IEntityTypeConfiguration<CollectionPreset>
{
    public void Configure(EntityTypeBuilder<CollectionPreset> builder)
    {
        builder.ToTable("CollectionPresets");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.PhotographerId);

        builder.Property(p => p.Name).HasMaxLength(500).IsRequired();
        builder.Property(p => p.FontFamily).HasMaxLength(100);
        builder.Property(p => p.ColorPalette).HasMaxLength(100);
        builder.Property(p => p.CustomColorHex).HasMaxLength(10);
        builder.Property(p => p.AllowedResolutions).HasMaxLength(500);
    }
}
