using Anansi.Domain.Entities.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class EventCalendarBlockConfiguration : IEntityTypeConfiguration<EventCalendarBlock>
{
    public void Configure(EntityTypeBuilder<EventCalendarBlock> builder)
    {
        builder.ToTable("EventCalendarBlocks");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.BlockType).HasConversion<string>().HasMaxLength(50);

        builder.HasIndex(b => b.PhotographerId);
        builder.HasIndex(b => b.CommunityEventId);
        builder.HasIndex(b => new { b.PhotographerId, b.CommunityEventId }).IsUnique();
    }
}
