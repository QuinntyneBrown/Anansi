using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Notifications.Queries;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<PagedList<NotificationDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<PagedList<NotificationDto>>.Failure("Not authenticated.", 401);

        var query = _context.Notifications
            .Where(n => n.PhotographerId == _currentUser.PhotographerId.Value);

        if (request.Category.HasValue)
            query = query.Where(n => n.Category == request.Category.Value);

        if (request.IsRead.HasValue)
            query = query.Where(n => n.IsRead == request.IsRead.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(
                n.Id,
                n.EventType,
                n.Category,
                n.Title,
                n.Message,
                n.ClientName,
                n.Link,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<PagedList<NotificationDto>>.Success(
            new PagedList<NotificationDto>(items, totalCount, request.Page, request.PageSize));
    }
}
