using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class BlogPostConfiguration : IEntityTypeConfiguration<BlogPost>
{
    public void Configure(EntityTypeBuilder<BlogPost> builder)
    {
        builder.ToTable("BlogPosts");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Excerpt).HasMaxLength(1000);
        builder.Property(e => e.BodyHtml).HasColumnType("text");
        builder.Property(e => e.FeaturedImageUrl).HasMaxLength(2048);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.MetaTitle).HasMaxLength(200);
        builder.Property(e => e.MetaDescription).HasMaxLength(500);
        builder.Property(e => e.OgImageUrl).HasMaxLength(2048);
        builder.Property(e => e.ImportedFromUrl).HasMaxLength(2048);
        builder.Property(e => e.CreatedBy).HasMaxLength(100);
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasOne(e => e.Website)
            .WithMany(w => w.BlogPosts)
            .HasForeignKey(e => e.WebsiteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => new { e.WebsiteId, e.Slug }).IsUnique();
        builder.HasIndex(e => new { e.WebsiteId, e.Status, e.PublishDate });
    }
}
