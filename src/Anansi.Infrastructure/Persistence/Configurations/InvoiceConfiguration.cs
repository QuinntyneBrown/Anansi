using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(i => i.Id);
        builder.HasIndex(i => i.PhotographerId);
        builder.HasIndex(i => i.ContactId);
        builder.HasIndex(i => i.Status);
        builder.HasIndex(i => i.InvoiceNumber);

        builder.Property(i => i.InvoiceNumber).HasMaxLength(50).IsRequired();
        builder.Property(i => i.Title).HasMaxLength(500).IsRequired();
        builder.Property(i => i.Notes).HasMaxLength(5000);
        builder.Property(i => i.HeaderImageUrl).HasMaxLength(2000);
        builder.Property(i => i.BrandColorHex).HasMaxLength(10);
        builder.Property(i => i.TemplateName).HasMaxLength(500);
        builder.Property(i => i.CustomHeaderFields).HasMaxLength(5000);

        builder.HasMany(i => i.LineItems)
            .WithOne(l => l.Invoice)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.PaymentSchedules)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
