using Anansi.Domain.Entities.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class EmailMessageConfiguration : IEntityTypeConfiguration<EmailMessage>
{
    public void Configure(EntityTypeBuilder<EmailMessage> builder)
    {
        builder.ToTable("EmailMessages");
        builder.HasKey(m => m.Id);
        builder.HasIndex(m => m.ConversationId);

        builder.Property(m => m.SenderEmail).HasMaxLength(500).IsRequired();
        builder.Property(m => m.SenderName).HasMaxLength(500);
        builder.Property(m => m.Body).IsRequired();

        builder.HasMany(m => m.Attachments)
            .WithOne(a => a.Message)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
