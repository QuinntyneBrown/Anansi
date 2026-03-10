using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class FavoriteItemConfiguration : IEntityTypeConfiguration<FavoriteItem>
{
    public void Configure(EntityTypeBuilder<FavoriteItem> builder)
    {
        builder.ToTable("FavoriteItems");
        builder.HasKey(i => i.Id);
        builder.HasIndex(i => i.FavoriteListId);
        builder.HasIndex(i => i.MediaId);

        builder.Property(i => i.Comment).HasMaxLength(5000);
    }
}
