using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class UrlRedirectConfiguration : IEntityTypeConfiguration<UrlRedirect>
{
    public void Configure(EntityTypeBuilder<UrlRedirect> builder)
    {
        builder.ToTable("UrlRedirects");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.SourcePath).HasMaxLength(2048).IsRequired();
        builder.Property(e => e.DestinationUrl).HasMaxLength(2048).IsRequired();
        builder.Property(e => e.RedirectType).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(e => e.Website)
            .WithMany(w => w.UrlRedirects)
            .HasForeignKey(e => e.WebsiteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PhotographerId);
        builder.HasIndex(e => new { e.WebsiteId, e.SourcePath });
    }
}
