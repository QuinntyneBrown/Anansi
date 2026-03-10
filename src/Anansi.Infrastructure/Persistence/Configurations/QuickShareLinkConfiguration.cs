using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class QuickShareLinkConfiguration : IEntityTypeConfiguration<QuickShareLink>
{
    public void Configure(EntityTypeBuilder<QuickShareLink> builder)
    {
        builder.ToTable("QuickShareLinks");
        builder.HasKey(q => q.Id);
        builder.HasIndex(q => q.CollectionId);
        builder.HasIndex(q => q.PhotographerId);
        builder.HasIndex(q => q.Token).IsUnique();

        builder.Property(q => q.Token).HasMaxLength(100).IsRequired();
        builder.Property(q => q.MediaIds).HasMaxLength(10000).IsRequired();
    }
}
