using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Events;

/// <summary>
/// List calendar blocks for the current photographer's booking calendar (EVT-24.2.2).
/// </summary>
public record ListCalendarBlocksQuery(
    DateTime? From,
    DateTime? To) : IRequest<Result<IReadOnlyList<EventCalendarBlockDto>>>;

public class ListCalendarBlocksHandler : IRequestHandler<ListCalendarBlocksQuery, Result<IReadOnlyList<EventCalendarBlockDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListCalendarBlocksHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<EventCalendarBlockDto>>> Handle(ListCalendarBlocksQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var query = _db.Set<EventCalendarBlock>()
            .Include(b => b.CommunityEvent)
            .Where(b => b.PhotographerId == photographerId)
            .AsQueryable();

        if (request.From.HasValue)
            query = query.Where(b => b.EndDate >= request.From.Value);
        if (request.To.HasValue)
            query = query.Where(b => b.StartDate <= request.To.Value);

        var blocks = await query
            .OrderBy(b => b.StartDate)
            .Select(b => new EventCalendarBlockDto(
                b.Id, b.PhotographerId, b.CommunityEventId,
                b.CommunityEvent.Name, b.BlockType,
                b.StartDate, b.EndDate, b.CreatedAt))
            .ToListAsync(ct);

        return Result<IReadOnlyList<EventCalendarBlockDto>>.Success(blocks);
    }
}
