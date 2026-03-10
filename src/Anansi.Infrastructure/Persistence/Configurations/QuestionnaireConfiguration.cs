using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class QuestionnaireConfiguration : IEntityTypeConfiguration<Questionnaire>
{
    public void Configure(EntityTypeBuilder<Questionnaire> builder)
    {
        builder.ToTable("Questionnaires");
        builder.HasKey(q => q.Id);
        builder.HasIndex(q => q.PhotographerId);
        builder.HasIndex(q => q.ContactId);
        builder.HasIndex(q => q.Status);
        builder.HasIndex(q => q.PublicSlug);

        builder.Property(q => q.Title).HasMaxLength(500).IsRequired();
        builder.Property(q => q.Description).HasMaxLength(5000);
        builder.Property(q => q.PublicSlug).HasMaxLength(500);
        builder.Property(q => q.TemplateName).HasMaxLength(500);

        builder.HasMany(q => q.Questions)
            .WithOne(qq => qq.Questionnaire)
            .HasForeignKey(qq => qq.QuestionnaireId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Responses)
            .WithOne(r => r.Questionnaire)
            .HasForeignKey(r => r.QuestionnaireId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
