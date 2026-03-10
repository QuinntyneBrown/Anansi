using Anansi.Domain.Entities.Branding;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class CustomDomainConfiguration : IEntityTypeConfiguration<CustomDomain>
{
    public void Configure(EntityTypeBuilder<CustomDomain> builder)
    {
        builder.ToTable("CustomDomains");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DomainName).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Purpose).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.SslStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.SslCertificateId).HasMaxLength(200);
        builder.Property(e => e.DnsInstructions).HasColumnType("text");
        builder.Property(e => e.VerificationToken).HasMaxLength(500);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => e.DomainName).IsUnique();
    }
}
