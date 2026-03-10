using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class CollectionSetConfiguration : IEntityTypeConfiguration<CollectionSet>
{
    public void Configure(EntityTypeBuilder<CollectionSet> builder)
    {
        builder.ToTable("CollectionSets");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.CollectionId);
        builder.HasIndex(s => s.PhotographerId);

        builder.Property(s => s.Title).HasMaxLength(500).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(5000);

        builder.HasMany(s => s.Media)
            .WithOne(m => m.Set)
            .HasForeignKey(m => m.SetId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
