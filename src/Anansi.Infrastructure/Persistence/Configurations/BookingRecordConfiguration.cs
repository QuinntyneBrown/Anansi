using Anansi.Domain.Entities.Booking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class BookingRecordConfiguration : IEntityTypeConfiguration<BookingRecord>
{
    public void Configure(EntityTypeBuilder<BookingRecord> builder)
    {
        builder.ToTable("BookingRecords");
        builder.HasKey(b => b.Id);
        builder.HasIndex(b => b.PhotographerId);
        builder.HasIndex(b => b.SessionTypeId);
        builder.HasIndex(b => b.ContactId);
        builder.HasIndex(b => b.Status);
        builder.HasIndex(b => b.StartTime);

        builder.Property(b => b.ClientFirstName).HasMaxLength(200).IsRequired();
        builder.Property(b => b.ClientLastName).HasMaxLength(200).IsRequired();
        builder.Property(b => b.ClientEmail).HasMaxLength(500).IsRequired();
        builder.Property(b => b.ClientPhone).HasMaxLength(50);
        builder.Property(b => b.Location).HasMaxLength(500);
        builder.Property(b => b.VideoCallLink).HasMaxLength(2000);
        builder.Property(b => b.GoogleCalendarEventId).HasMaxLength(500);
        builder.Property(b => b.CouponCode).HasMaxLength(100);
        builder.Property(b => b.Notes).HasMaxLength(5000);
    }
}
