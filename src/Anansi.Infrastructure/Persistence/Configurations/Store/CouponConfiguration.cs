using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Store;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).HasMaxLength(50).IsRequired();
        builder.Property(c => c.CouponType).HasConversion<string>().HasMaxLength(50);
        builder.Property(c => c.Scope).HasConversion<string>().HasMaxLength(50);
        builder.Property(c => c.PercentageValue).HasPrecision(5, 2);
        builder.Property(c => c.BannerText).HasMaxLength(500);
        builder.Property(c => c.BannerColorHex).HasMaxLength(7);

        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => new { c.PhotographerId, c.Code }).IsUnique();
    }
}
