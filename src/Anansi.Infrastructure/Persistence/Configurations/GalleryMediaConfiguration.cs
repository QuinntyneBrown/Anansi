using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class GalleryMediaConfiguration : IEntityTypeConfiguration<GalleryMedia>
{
    public void Configure(EntityTypeBuilder<GalleryMedia> builder)
    {
        builder.ToTable("GalleryMedia");
        builder.HasKey(m => m.Id);
        builder.HasIndex(m => m.CollectionId);
        builder.HasIndex(m => m.SetId);
        builder.HasIndex(m => m.PhotographerId);

        builder.Property(m => m.FileName).HasMaxLength(500).IsRequired();
        builder.Property(m => m.OriginalFileName).HasMaxLength(500).IsRequired();
        builder.Property(m => m.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(m => m.StorageKey).HasMaxLength(1000).IsRequired();
        builder.Property(m => m.ThumbnailStorageKey).HasMaxLength(1000);
        builder.Property(m => m.CameraMake).HasMaxLength(200);
        builder.Property(m => m.CameraModel).HasMaxLength(200);
        builder.Property(m => m.LensModel).HasMaxLength(200);
        builder.Property(m => m.Aperture).HasMaxLength(50);
        builder.Property(m => m.ShutterSpeed).HasMaxLength(50);
        builder.Property(m => m.VideoResolution).HasMaxLength(50);
        builder.Property(m => m.CustomVideoThumbnailKey).HasMaxLength(1000);
    }
}
