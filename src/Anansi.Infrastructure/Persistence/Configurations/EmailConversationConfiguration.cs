using Anansi.Domain.Entities.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class EmailConversationConfiguration : IEntityTypeConfiguration<EmailConversation>
{
    public void Configure(EntityTypeBuilder<EmailConversation> builder)
    {
        builder.ToTable("EmailConversations");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => c.ContactId);

        builder.Property(c => c.Subject).HasMaxLength(1000).IsRequired();
        builder.Property(c => c.ClientEmail).HasMaxLength(500);
        builder.Property(c => c.ClientName).HasMaxLength(500);

        builder.HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
