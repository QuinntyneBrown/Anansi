using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Notifications.Commands;

public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPushNotificationService _pushService;

    public CreateNotificationCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IPushNotificationService pushService)
    {
        _context = context;
        _emailService = emailService;
        _pushService = pushService;
    }

    public async Task<Result<Guid>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        // Check preferences for this event type
        var preference = await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.PhotographerId == request.PhotographerId
                && p.EventType == request.EventType, cancellationToken);

        var inAppEnabled = preference?.InAppEnabled ?? true;
        var emailEnabled = preference?.EmailEnabled ?? true;
        var pushEnabled = preference?.PushEnabled ?? true;

        Guid notificationId = Guid.Empty;

        // Create in-app notification
        if (inAppEnabled)
        {
            var notification = new Notification
            {
                PhotographerId = request.PhotographerId,
                EventType = request.EventType,
                Category = request.Category,
                Title = request.Title,
                Message = request.Message,
                ClientName = request.ClientName,
                Link = request.Link
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);
            notificationId = notification.Id;
        }

        // Send email notification if enabled
        if (emailEnabled)
        {
            var photographer = await _context.Set<Domain.Entities.Photographer>()
                .FirstOrDefaultAsync(p => p.Id == request.PhotographerId, cancellationToken);

            if (photographer != null)
            {
                await _emailService.SendTemplatedAsync(
                    photographer.Email,
                    "notification",
                    new Dictionary<string, string>
                    {
                        { "Title", request.Title },
                        { "Message", request.Message },
                        { "Link", request.Link ?? "" }
                    },
                    cancellationToken);
            }
        }

        // Send push notification if enabled
        if (pushEnabled)
        {
            var photographer = await _context.Set<Domain.Entities.Photographer>()
                .FirstOrDefaultAsync(p => p.Id == request.PhotographerId, cancellationToken);

            if (photographer?.IdentityUserId != null)
            {
                await _pushService.SendAsync(
                    photographer.IdentityUserId,
                    request.Title,
                    request.Message,
                    request.Link,
                    cancellationToken);
            }
        }

        return Result<Guid>.Success(notificationId);
    }
}
