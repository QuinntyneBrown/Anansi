using Anansi.Domain.Entities.Booking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class BookingCouponConfiguration : IEntityTypeConfiguration<BookingCoupon>
{
    public void Configure(EntityTypeBuilder<BookingCoupon> builder)
    {
        builder.ToTable("BookingCoupons");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => c.Code);

        builder.Property(c => c.Code).HasMaxLength(100).IsRequired();
    }
}
