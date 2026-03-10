using Anansi.Domain.Entities.Branding;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WatermarkConfiguration : IEntityTypeConfiguration<Watermark>
{
    public void Configure(EntityTypeBuilder<Watermark> builder)
    {
        builder.ToTable("Watermarks");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Text).HasMaxLength(500);
        builder.Property(e => e.FontFamily).HasMaxLength(200);
        builder.Property(e => e.ImageUrl).HasMaxLength(2048);
        builder.Property(e => e.Position).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => e.PhotographerId);
    }
}
