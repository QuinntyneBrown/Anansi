using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class GalleryAssistConfigConfiguration : IEntityTypeConfiguration<GalleryAssistConfig>
{
    public void Configure(EntityTypeBuilder<GalleryAssistConfig> builder)
    {
        builder.HasKey(g => g.Id);

        builder.HasIndex(g => new { g.PhotographerId, g.CollectionId }).IsUnique();
    }
}
