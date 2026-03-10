using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Notifications.Queries;

public class GetNotificationPreferencesQueryHandler : IRequestHandler<GetNotificationPreferencesQuery, Result<IReadOnlyList<NotificationPreferenceDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationPreferencesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<NotificationPreferenceDto>>> Handle(GetNotificationPreferencesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<IReadOnlyList<NotificationPreferenceDto>>.Failure("Not authenticated.", 401);

        var preferences = await _context.NotificationPreferences
            .Where(p => p.PhotographerId == _currentUser.PhotographerId.Value)
            .Select(p => new NotificationPreferenceDto(
                p.Id,
                p.EventType,
                p.EmailEnabled,
                p.PushEnabled,
                p.InAppEnabled,
                p.EmailDigestOption))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<NotificationPreferenceDto>>.Success(preferences);
    }
}
