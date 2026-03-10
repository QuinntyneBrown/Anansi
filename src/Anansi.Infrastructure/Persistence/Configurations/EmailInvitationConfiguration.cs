using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class EmailInvitationConfiguration : IEntityTypeConfiguration<EmailInvitation>
{
    public void Configure(EntityTypeBuilder<EmailInvitation> builder)
    {
        builder.ToTable("EmailInvitations");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => e.CollectionId);
        builder.HasIndex(e => e.PhotographerId);

        builder.Property(e => e.RecipientEmail).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Subject).HasMaxLength(1000).IsRequired();
        builder.Property(e => e.Body).HasMaxLength(10000).IsRequired();
        builder.Property(e => e.HeaderImageUrl).HasMaxLength(2000);
    }
}
