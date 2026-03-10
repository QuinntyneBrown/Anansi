using Anansi.Domain.Entities.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Billing;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(1000);
        builder.Property(p => p.Product).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.Tier).HasConversion<string>().HasMaxLength(50);

        builder.HasIndex(p => new { p.Product, p.Tier }).IsUnique();

        builder.HasMany(p => p.FeatureGates)
            .WithOne(fg => fg.Plan)
            .HasForeignKey(fg => fg.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
