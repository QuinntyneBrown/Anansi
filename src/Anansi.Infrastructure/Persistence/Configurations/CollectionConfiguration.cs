using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class CollectionConfiguration : IEntityTypeConfiguration<Collection>
{
    public void Configure(EntityTypeBuilder<Collection> builder)
    {
        builder.ToTable("Collections");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.PhotographerId);
        builder.HasIndex(c => c.Slug);
        builder.HasIndex(c => c.Status);

        builder.Property(c => c.Title).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(5000);
        builder.Property(c => c.Password).HasMaxLength(200);
        builder.Property(c => c.ClientExclusivePassword).HasMaxLength(200);
        builder.Property(c => c.DownloadPin).HasMaxLength(10);
        builder.Property(c => c.FontFamily).HasMaxLength(100);
        builder.Property(c => c.ColorPalette).HasMaxLength(100);
        builder.Property(c => c.CustomColorHex).HasMaxLength(10);
        builder.Property(c => c.CoverVideoUrl).HasMaxLength(2000);
        builder.Property(c => c.AllowedResolutions).HasMaxLength(500);
        builder.Property(c => c.ExpiryReminderRecipients).HasMaxLength(5000);
        builder.Property(c => c.ExpiryReminderDays).HasMaxLength(100);
        builder.Property(c => c.ExpiryReminderEmailTemplate).HasMaxLength(10000);
        builder.Property(c => c.EmbedCode).HasMaxLength(5000);
        builder.Property(c => c.GoogleAnalyticsPropertyId).HasMaxLength(100);

        builder.HasMany(c => c.Sets)
            .WithOne(s => s.Collection)
            .HasForeignKey(s => s.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Media)
            .WithOne(m => m.Collection)
            .HasForeignKey(m => m.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.FavoriteLists)
            .WithOne(f => f.Collection)
            .HasForeignKey(f => f.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Activities)
            .WithOne(a => a.Collection)
            .HasForeignKey(a => a.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.EmailRegistrations)
            .WithOne(e => e.Collection)
            .HasForeignKey(e => e.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.EmailInvitations)
            .WithOne(e => e.Collection)
            .HasForeignKey(e => e.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.QuickShareLinks)
            .WithOne(q => q.Collection)
            .HasForeignKey(q => q.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.DownloadRequests)
            .WithOne(d => d.Collection)
            .HasForeignKey(d => d.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
