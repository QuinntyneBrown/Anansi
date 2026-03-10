using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class BlogPostCategoryConfiguration : IEntityTypeConfiguration<BlogPostCategory>
{
    public void Configure(EntityTypeBuilder<BlogPostCategory> builder)
    {
        builder.ToTable("BlogPostCategories");
        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.BlogPost)
            .WithMany(p => p.BlogPostCategories)
            .HasForeignKey(e => e.BlogPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.BlogCategory)
            .WithMany(c => c.BlogPostCategories)
            .HasForeignKey(e => e.BlogCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.BlogPostId, e.BlogCategoryId }).IsUnique();
    }
}
