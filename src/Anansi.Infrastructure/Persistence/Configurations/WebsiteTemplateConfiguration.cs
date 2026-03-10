using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WebsiteTemplateConfiguration : IEntityTypeConfiguration<WebsiteTemplate>
{
    public void Configure(EntityTypeBuilder<WebsiteTemplate> builder)
    {
        builder.ToTable("WebsiteTemplates");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(1000);
        builder.Property(e => e.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.PreviewImageUrl).HasMaxLength(2048);
        builder.Property(e => e.ThumbnailUrl).HasMaxLength(2048);
        builder.Property(e => e.LayoutDefinitionJson).HasColumnType("text");
    }
}
