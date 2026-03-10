using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class WebsiteAnalyticsSnapshotConfiguration : IEntityTypeConfiguration<WebsiteAnalyticsSnapshot>
{
    public void Configure(EntityTypeBuilder<WebsiteAnalyticsSnapshot> builder)
    {
        builder.ToTable("WebsiteAnalyticsSnapshots");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.GeographicDistributionJson).HasColumnType("text");
        builder.Property(e => e.TopPagesJson).HasColumnType("text");

        builder.HasOne(e => e.Website)
            .WithMany(w => w.AnalyticsSnapshots)
            .HasForeignKey(e => e.WebsiteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => new { e.WebsiteId, e.Date }).IsUnique();
    }
}
