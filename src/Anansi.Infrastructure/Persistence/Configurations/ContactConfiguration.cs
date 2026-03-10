using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.ToTable("Contacts");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => c.Email);
        builder.HasIndex(c => c.ContactType);

        builder.Property(c => c.FirstName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.LastName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Email).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(50);
        builder.Property(c => c.Address).HasMaxLength(500);
        builder.Property(c => c.City).HasMaxLength(200);
        builder.Property(c => c.Province).HasMaxLength(200);
        builder.Property(c => c.PostalCode).HasMaxLength(20);
        builder.Property(c => c.Country).HasMaxLength(100);
        builder.Property(c => c.Notes).HasMaxLength(10000);

        builder.HasMany(c => c.Projects)
            .WithOne(p => p.Contact)
            .HasForeignKey(p => p.ContactId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
