using Anansi.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class PaymentRecordConfiguration : IEntityTypeConfiguration<PaymentRecord>
{
    public void Configure(EntityTypeBuilder<PaymentRecord> builder)
    {
        builder.ToTable("PaymentRecords");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.PhotographerId);
        builder.HasIndex(p => p.ContactId);
        builder.HasIndex(p => p.InvoiceId);
        builder.HasIndex(p => p.BookingId);
        builder.HasIndex(p => p.PaymentMethod);
        builder.HasIndex(p => p.CreatedAt);

        builder.Property(p => p.Currency).HasMaxLength(10).IsRequired();
        builder.Property(p => p.ExternalPaymentId).HasMaxLength(500);
        builder.Property(p => p.CardLast4).HasMaxLength(4);
        builder.Property(p => p.Description).HasMaxLength(1000);
    }
}
