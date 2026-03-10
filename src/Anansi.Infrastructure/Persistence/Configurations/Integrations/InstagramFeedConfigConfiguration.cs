using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class InstagramFeedConfigConfiguration : IEntityTypeConfiguration<InstagramFeedConfig>
{
    public void Configure(EntityTypeBuilder<InstagramFeedConfig> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.ImageSize).IsRequired().HasMaxLength(50);
        builder.Property(i => i.ClickBehavior).IsRequired().HasMaxLength(50);

        builder.HasIndex(i => i.PhotographerId).IsUnique();
    }
}
