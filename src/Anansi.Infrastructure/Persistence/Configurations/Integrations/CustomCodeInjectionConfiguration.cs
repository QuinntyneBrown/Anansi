using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class CustomCodeInjectionConfiguration : IEntityTypeConfiguration<CustomCodeInjection>
{
    public void Configure(EntityTypeBuilder<CustomCodeInjection> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50000);
        builder.Property(c => c.Label).HasMaxLength(256);

        builder.HasIndex(c => c.PhotographerId);
    }
}
