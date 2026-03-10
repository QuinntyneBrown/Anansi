using Anansi.Domain.Entities.Galleries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class DownloadRequestConfiguration : IEntityTypeConfiguration<DownloadRequest>
{
    public void Configure(EntityTypeBuilder<DownloadRequest> builder)
    {
        builder.ToTable("DownloadRequests");
        builder.HasKey(d => d.Id);
        builder.HasIndex(d => d.CollectionId);
        builder.HasIndex(d => d.PhotographerId);

        builder.Property(d => d.RequestedBy).HasMaxLength(500);
        builder.Property(d => d.RequestedByEmail).HasMaxLength(500);
        builder.Property(d => d.MediaIds).HasMaxLength(10000);
        builder.Property(d => d.ZipStorageKey).HasMaxLength(1000);
    }
}
