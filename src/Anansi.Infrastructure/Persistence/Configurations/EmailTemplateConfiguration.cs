using Anansi.Domain.Entities.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("EmailTemplates");
        builder.HasKey(t => t.Id);
        builder.HasIndex(t => t.PhotographerId);
        builder.HasIndex(t => t.Category);

        builder.Property(t => t.Name).HasMaxLength(500).IsRequired();
        builder.Property(t => t.Category).HasMaxLength(100).IsRequired();
        builder.Property(t => t.SubjectLine).HasMaxLength(1000);
        builder.Property(t => t.Body).IsRequired();
        builder.Property(t => t.HeaderImageUrl).HasMaxLength(2000);
    }
}
