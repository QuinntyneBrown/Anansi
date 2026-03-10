using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ColorPaletteConfiguration : IEntityTypeConfiguration<ColorPalette>
{
    public void Configure(EntityTypeBuilder<ColorPalette> builder)
    {
        builder.ToTable("ColorPalettes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.ColorsJson).HasColumnType("text");

        builder.HasIndex(e => e.PhotographerId);
    }
}
