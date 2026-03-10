using Anansi.Domain.Entities.Discovery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Discovery;

public class PhotographerCulturalTagConfiguration : IEntityTypeConfiguration<PhotographerCulturalTag>
{
    public void Configure(EntityTypeBuilder<PhotographerCulturalTag> builder)
    {
        builder.ToTable("PhotographerCulturalTags");
        builder.HasKey(pt => pt.Id);
        builder.HasIndex(pt => new { pt.PhotographerId, pt.CulturalTagId }).IsUnique();
        builder.HasIndex(pt => pt.PhotographerId);
        builder.HasIndex(pt => pt.CulturalTagId);

        builder.HasOne(pt => pt.CulturalTag)
            .WithMany()
            .HasForeignKey(pt => pt.CulturalTagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
