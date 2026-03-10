using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class FavoriteListConfiguration : IEntityTypeConfiguration<FavoriteList>
{
    public void Configure(EntityTypeBuilder<FavoriteList> builder)
    {
        builder.ToTable("FavoriteLists");
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => f.CollectionId);
        builder.HasIndex(f => f.PhotographerId);
        builder.HasIndex(f => f.ShareToken).IsUnique().HasFilter("\"ShareToken\" IS NOT NULL");

        builder.Property(f => f.Name).HasMaxLength(500).IsRequired();
        builder.Property(f => f.ClientName).HasMaxLength(500);
        builder.Property(f => f.ClientEmail).HasMaxLength(500);
        builder.Property(f => f.ShareToken).HasMaxLength(100);

        builder.HasMany(f => f.Items)
            .WithOne(i => i.FavoriteList)
            .HasForeignKey(i => i.FavoriteListId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
