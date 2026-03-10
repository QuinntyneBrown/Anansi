using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class TaxRateConfiguration : IEntityTypeConfiguration<TaxRate>
{
    public void Configure(EntityTypeBuilder<TaxRate> builder)
    {
        builder.ToTable("TaxRates");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(256).IsRequired();
        builder.Property(t => t.Region).HasMaxLength(100).IsRequired();
        builder.Property(t => t.Percentage).HasPrecision(5, 2);

        builder.HasIndex(t => t.PhotographerId);
    }
}
