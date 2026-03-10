using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class GalleryActivityConfiguration : IEntityTypeConfiguration<GalleryActivity>
{
    public void Configure(EntityTypeBuilder<GalleryActivity> builder)
    {
        builder.ToTable("GalleryActivities");
        builder.HasKey(a => a.Id);
        builder.HasIndex(a => a.CollectionId);
        builder.HasIndex(a => a.PhotographerId);
        builder.HasIndex(a => a.ActivityType);
        builder.HasIndex(a => a.CreatedAt);

        builder.Property(a => a.ActorName).HasMaxLength(500);
        builder.Property(a => a.ActorEmail).HasMaxLength(500);
        builder.Property(a => a.Details).HasMaxLength(5000);
    }
}
