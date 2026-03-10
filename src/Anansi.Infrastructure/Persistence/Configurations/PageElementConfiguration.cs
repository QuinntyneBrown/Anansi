using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class PageElementConfiguration : IEntityTypeConfiguration<PageElement>
{
    public void Configure(EntityTypeBuilder<PageElement> builder)
    {
        builder.ToTable("PageElements");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ElementType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.ContentJson).HasColumnType("text");

        builder.HasOne(e => e.Page)
            .WithMany(p => p.Elements)
            .HasForeignKey(e => e.PageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ParentElement)
            .WithMany(e => e.ChildElements)
            .HasForeignKey(e => e.ParentElementId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => e.PageId);
    }
}
