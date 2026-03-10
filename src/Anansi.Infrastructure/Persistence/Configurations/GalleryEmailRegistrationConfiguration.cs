using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class GalleryEmailRegistrationConfiguration : IEntityTypeConfiguration<GalleryEmailRegistration>
{
    public void Configure(EntityTypeBuilder<GalleryEmailRegistration> builder)
    {
        builder.ToTable("GalleryEmailRegistrations");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => e.CollectionId);
        builder.HasIndex(e => e.PhotographerId);

        builder.Property(e => e.Name).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Email).HasMaxLength(500).IsRequired();
    }
}
