using Anansi.Domain.Entities.Discovery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Discovery;

public class CulturalTagConfiguration : IEntityTypeConfiguration<CulturalTag>
{
    public void Configure(EntityTypeBuilder<CulturalTag> builder)
    {
        builder.ToTable("CulturalTags");
        builder.HasKey(t => t.Id);
        builder.HasIndex(t => t.Name).IsUnique();

        builder.Property(t => t.Name).HasMaxLength(50).IsRequired();
        builder.Property(t => t.IsSystem).IsRequired();
    }
}
