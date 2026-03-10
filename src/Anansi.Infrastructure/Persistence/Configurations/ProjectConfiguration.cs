using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.PhotographerId);
        builder.HasIndex(p => p.StageId);
        builder.HasIndex(p => p.ContactId);

        builder.Property(p => p.Name).HasMaxLength(500).IsRequired();
        builder.Property(p => p.ProjectType).HasMaxLength(200);
    }
}
