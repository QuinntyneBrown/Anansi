using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class LandingPageTemplateConfiguration : IEntityTypeConfiguration<LandingPageTemplate>
{
    public void Configure(EntityTypeBuilder<LandingPageTemplate> builder)
    {
        builder.ToTable("LandingPageTemplates");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(1000);
        builder.Property(e => e.UseCase).HasMaxLength(200).IsRequired();
        builder.Property(e => e.LayoutDefinitionJson).HasColumnType("text");
        builder.Property(e => e.PreviewImageUrl).HasMaxLength(2048);
    }
}
