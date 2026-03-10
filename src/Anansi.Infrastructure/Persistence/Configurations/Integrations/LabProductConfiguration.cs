using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class LabProductConfiguration : IEntityTypeConfiguration<LabProduct>
{
    public void Configure(EntityTypeBuilder<LabProduct> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.LabName).IsRequired().HasMaxLength(256);
        builder.Property(l => l.ProductName).IsRequired().HasMaxLength(256);
        builder.Property(l => l.Category).IsRequired().HasMaxLength(256);
        builder.Property(l => l.Size).IsRequired().HasMaxLength(100);

        builder.HasIndex(l => l.LabName);
        builder.HasIndex(l => new { l.LabName, l.Category });
    }
}
