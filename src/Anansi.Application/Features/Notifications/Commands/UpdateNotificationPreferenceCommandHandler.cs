using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Notifications.Commands;

public class UpdateNotificationPreferenceCommandHandler : IRequestHandler<UpdateNotificationPreferenceCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateNotificationPreferenceCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var preference = await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.PhotographerId == _currentUser.PhotographerId.Value
                && p.EventType == request.EventType, cancellationToken);

        if (preference == null)
        {
            preference = new NotificationPreference
            {
                PhotographerId = _currentUser.PhotographerId.Value,
                EventType = request.EventType,
                EmailEnabled = request.EmailEnabled,
                PushEnabled = request.PushEnabled,
                InAppEnabled = request.InAppEnabled,
                EmailDigestOption = request.EmailDigestOption
            };
            _context.NotificationPreferences.Add(preference);
        }
        else
        {
            preference.EmailEnabled = request.EmailEnabled;
            preference.PushEnabled = request.PushEnabled;
            preference.InAppEnabled = request.InAppEnabled;
            preference.EmailDigestOption = request.EmailDigestOption;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
