using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WebsiteFontConfiguration : IEntityTypeConfiguration<WebsiteFont>
{
    public void Configure(EntityTypeBuilder<WebsiteFont> builder)
    {
        builder.ToTable("WebsiteFonts");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FontFamily).HasMaxLength(200).IsRequired();
        builder.Property(e => e.FileUrl).HasMaxLength(2048).IsRequired();
        builder.Property(e => e.FileFormat).HasMaxLength(20).IsRequired();
        builder.Property(e => e.FontWeight).HasMaxLength(20);
        builder.Property(e => e.FontStyle).HasMaxLength(20);

        builder.HasIndex(e => e.PhotographerId);
    }
}
