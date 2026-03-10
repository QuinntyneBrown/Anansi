using Anansi.Domain.Entities.Branding;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class DocumentBrandingConfiguration : IEntityTypeConfiguration<DocumentBranding>
{
    public void Configure(EntityTypeBuilder<DocumentBranding> builder)
    {
        builder.ToTable("DocumentBrandings");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DocumentType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.HeaderImageUrl).HasMaxLength(2048);
        builder.Property(e => e.BrandColorHex).HasMaxLength(20);
        builder.Property(e => e.SecondaryColorHex).HasMaxLength(20);
        builder.Property(e => e.FontTheme).HasMaxLength(200);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => new { e.PhotographerId, e.DocumentType }).IsUnique();
    }
}
