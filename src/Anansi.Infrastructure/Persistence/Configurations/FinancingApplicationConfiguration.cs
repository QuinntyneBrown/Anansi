using Anansi.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class FinancingApplicationConfiguration : IEntityTypeConfiguration<FinancingApplication>
{
    public void Configure(EntityTypeBuilder<FinancingApplication> builder)
    {
        builder.ToTable("FinancingApplications");
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => f.PhotographerId);

        builder.Property(f => f.Status).HasMaxLength(50).IsRequired();
        builder.Property(f => f.RepaymentPercentage).HasPrecision(5, 2);
    }
}
