using Anansi.Domain.Entities.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Billing;

public class PlanFeatureGateConfiguration : IEntityTypeConfiguration<PlanFeatureGate>
{
    public void Configure(EntityTypeBuilder<PlanFeatureGate> builder)
    {
        builder.ToTable("PlanFeatureGates");
        builder.HasKey(fg => fg.Id);
        builder.Property(fg => fg.FeatureKey).HasMaxLength(100).IsRequired();
        builder.Property(fg => fg.FeatureValue).HasMaxLength(256).IsRequired();
        builder.Property(fg => fg.Description).HasMaxLength(500);

        builder.HasIndex(fg => new { fg.PlanId, fg.FeatureKey }).IsUnique();
    }
}
