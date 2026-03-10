using Anansi.Domain.Entities.Booking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class SessionTypeConfiguration : IEntityTypeConfiguration<SessionType>
{
    public void Configure(EntityTypeBuilder<SessionType> builder)
    {
        builder.ToTable("SessionTypes");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.PhotographerId);

        builder.Property(s => s.Name).HasMaxLength(500).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(5000);
        builder.Property(s => s.Location).HasMaxLength(500);
        builder.Property(s => s.AvailabilityWindows).HasMaxLength(10000);
        builder.Property(s => s.VideoCallType).HasMaxLength(50);
        builder.Property(s => s.IntakeDocumentIds).HasMaxLength(2000);
        builder.Property(s => s.CoverImageUrl).HasMaxLength(2000);

        builder.HasMany(s => s.MiniSessionDates)
            .WithOne(d => d.SessionType)
            .HasForeignKey(d => d.SessionTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Bookings)
            .WithOne(b => b.SessionType)
            .HasForeignKey(b => b.SessionTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
