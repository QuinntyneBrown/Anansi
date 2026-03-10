using Anansi.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title).IsRequired().HasMaxLength(256);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(2000);
        builder.Property(n => n.ClientName).HasMaxLength(256);
        builder.Property(n => n.Link).HasMaxLength(2048);

        builder.HasIndex(n => n.PhotographerId);
        builder.HasIndex(n => new { n.PhotographerId, n.IsRead });
        builder.HasIndex(n => new { n.PhotographerId, n.Category });
        builder.HasIndex(n => n.CreatedAt);
    }
}
