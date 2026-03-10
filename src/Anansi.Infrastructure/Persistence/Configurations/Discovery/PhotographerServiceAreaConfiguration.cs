using Anansi.Domain.Entities.Discovery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Discovery;

public class PhotographerServiceAreaConfiguration : IEntityTypeConfiguration<PhotographerServiceArea>
{
    public void Configure(EntityTypeBuilder<PhotographerServiceArea> builder)
    {
        builder.ToTable("PhotographerServiceAreas");
        builder.HasKey(sa => sa.Id);
        builder.HasIndex(sa => sa.PhotographerId).IsUnique();

        builder.Property(sa => sa.Neighborhood).HasMaxLength(100).IsRequired();
        builder.Property(sa => sa.Latitude).IsRequired();
        builder.Property(sa => sa.Longitude).IsRequired();
        builder.Property(sa => sa.RadiusKm).IsRequired();
    }
}
