using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class LeadCaptureFormConfiguration : IEntityTypeConfiguration<LeadCaptureForm>
{
    public void Configure(EntityTypeBuilder<LeadCaptureForm> builder)
    {
        builder.ToTable("LeadCaptureForms");
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => f.PhotographerId);
        builder.HasIndex(f => f.Slug).IsUnique();

        builder.Property(f => f.Name).HasMaxLength(500).IsRequired();
        builder.Property(f => f.Description).HasMaxLength(5000);
        builder.Property(f => f.Slug).HasMaxLength(500).IsRequired();
        builder.Property(f => f.EmbedCode).HasMaxLength(10000);

        builder.HasMany(f => f.Fields)
            .WithOne(ff => ff.Form)
            .HasForeignKey(ff => ff.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(f => f.Submissions)
            .WithOne(s => s.Form)
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
