using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class QuoteConfiguration : IEntityTypeConfiguration<Quote>
{
    public void Configure(EntityTypeBuilder<Quote> builder)
    {
        builder.ToTable("Quotes");
        builder.HasKey(q => q.Id);
        builder.HasIndex(q => q.PhotographerId);
        builder.HasIndex(q => q.ContactId);
        builder.HasIndex(q => q.Status);

        builder.Property(q => q.Title).HasMaxLength(500).IsRequired();
        builder.Property(q => q.Notes).HasMaxLength(5000);
        builder.Property(q => q.TemplateName).HasMaxLength(500);

        builder.HasMany(q => q.Items)
            .WithOne(i => i.Quote)
            .HasForeignKey(i => i.QuoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
