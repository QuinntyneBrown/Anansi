using Anansi.Domain.Entities.Integrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Integrations;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Name).IsRequired().HasMaxLength(256);
        builder.Property(k => k.KeyHash).IsRequired().HasMaxLength(512);
        builder.Property(k => k.KeyPrefix).IsRequired().HasMaxLength(16);

        builder.HasIndex(k => k.PhotographerId);
        builder.HasIndex(k => k.KeyPrefix);
    }
}
