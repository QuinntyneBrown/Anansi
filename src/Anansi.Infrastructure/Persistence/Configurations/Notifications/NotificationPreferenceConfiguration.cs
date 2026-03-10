using Anansi.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.HasKey(np => np.Id);

        builder.HasIndex(np => new { np.PhotographerId, np.EventType }).IsUnique();
    }
}
