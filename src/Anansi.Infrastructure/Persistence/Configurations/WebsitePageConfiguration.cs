using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WebsitePageConfiguration : IEntityTypeConfiguration<WebsitePage>
{
    public void Configure(EntityTypeBuilder<WebsitePage> builder)
    {
        builder.ToTable("WebsitePages");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(200).IsRequired();
        builder.Property(e => e.PageType).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.PagePasswordHash).HasMaxLength(500);
        builder.Property(e => e.MetaTitle).HasMaxLength(200);
        builder.Property(e => e.MetaDescription).HasMaxLength(500);
        builder.Property(e => e.OgImageUrl).HasMaxLength(2048);

        builder.HasOne(e => e.Website)
            .WithMany(w => w.Pages)
            .HasForeignKey(e => e.WebsiteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => new { e.WebsiteId, e.Slug }).IsUnique();
    }
}
