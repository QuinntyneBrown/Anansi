using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ProjectStageConfiguration : IEntityTypeConfiguration<ProjectStage>
{
    public void Configure(EntityTypeBuilder<ProjectStage> builder)
    {
        builder.ToTable("ProjectStages");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.PhotographerId);

        builder.Property(s => s.Name).HasMaxLength(200).IsRequired();

        builder.HasMany(s => s.Projects)
            .WithOne(p => p.Stage)
            .HasForeignKey(p => p.StageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
