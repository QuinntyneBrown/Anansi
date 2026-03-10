using Anansi.Domain.Entities.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class AutomatedEmailConfigConfiguration : IEntityTypeConfiguration<AutomatedEmailConfig>
{
    public void Configure(EntityTypeBuilder<AutomatedEmailConfig> builder)
    {
        builder.ToTable("AutomatedEmailConfigs");
        builder.HasKey(a => a.Id);
        builder.HasIndex(a => a.PhotographerId);
        builder.HasIndex(a => a.EventType);

        builder.Property(a => a.EventType).HasMaxLength(100).IsRequired();
        builder.Property(a => a.RecipientTypes).HasMaxLength(2000);
        builder.Property(a => a.DaysBeforeEvent).HasMaxLength(200);
    }
}
