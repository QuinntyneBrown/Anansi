using Anansi.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("Contracts");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => c.ContactId);
        builder.HasIndex(c => c.Status);

        builder.Property(c => c.Title).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Content).IsRequired();
        builder.Property(c => c.HeaderImageUrl).HasMaxLength(2000);
        builder.Property(c => c.TemplateName).HasMaxLength(500);

        builder.HasMany(c => c.Fields)
            .WithOne(f => f.Contract)
            .HasForeignKey(f => f.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Signatures)
            .WithOne(s => s.Contract)
            .HasForeignKey(s => s.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
