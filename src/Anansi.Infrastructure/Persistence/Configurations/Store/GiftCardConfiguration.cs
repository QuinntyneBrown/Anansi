using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class GiftCardConfiguration : IEntityTypeConfiguration<GiftCard>
{
    public void Configure(EntityTypeBuilder<GiftCard> builder)
    {
        builder.ToTable("GiftCards");
        builder.HasKey(gc => gc.Id);
        builder.Property(gc => gc.Code).HasMaxLength(50).IsRequired();
        builder.Property(gc => gc.RecipientEmail).HasMaxLength(256);
        builder.Property(gc => gc.RecipientName).HasMaxLength(256);
        builder.Property(gc => gc.SenderName).HasMaxLength(256);
        builder.Property(gc => gc.Message).HasMaxLength(1000);

        builder.HasIndex(gc => gc.PhotographerId);
        builder.HasIndex(gc => new { gc.PhotographerId, gc.Code }).IsUnique();
    }
}
