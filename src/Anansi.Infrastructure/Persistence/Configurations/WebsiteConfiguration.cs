using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WebsiteConfiguration : IEntityTypeConfiguration<Website>
{
    public void Configure(EntityTypeBuilder<Website> builder)
    {
        builder.ToTable("Websites");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Subdomain).HasMaxLength(100).IsRequired();
        builder.Property(e => e.CustomDomain).HasMaxLength(500);
        builder.Property(e => e.PrimaryFontFamily).HasMaxLength(200);
        builder.Property(e => e.SecondaryFontFamily).HasMaxLength(200);
        builder.Property(e => e.CustomFontUrl).HasMaxLength(2048);
        builder.Property(e => e.ColorPaletteJson).HasColumnType("text");
        builder.Property(e => e.AnimationType).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.SitePasswordHash).HasMaxLength(500);
        builder.Property(e => e.DefaultMetaTitle).HasMaxLength(200);
        builder.Property(e => e.DefaultMetaDescription).HasMaxLength(500);
        builder.Property(e => e.DefaultOgImageUrl).HasMaxLength(2048);
        builder.Property(e => e.GoogleAnalyticsMeasurementId).HasMaxLength(50);
        builder.Property(e => e.FacebookPixelId).HasMaxLength(50);
        builder.Property(e => e.BlogLayout).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.CreatedBy).HasMaxLength(100);
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasOne(e => e.Template)
            .WithMany(t => t.Websites)
            .HasForeignKey(e => e.TemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Photographer)
            .WithMany()
            .HasForeignKey(e => e.PhotographerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => e.Subdomain).IsUnique();
        builder.HasIndex(e => new { e.PhotographerId, e.Status });
    }
}
