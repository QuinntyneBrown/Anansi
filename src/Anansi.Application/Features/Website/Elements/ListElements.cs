using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Elements;

public record ListElementsQuery(Guid PageId) : IRequest<Result<List<PageElementDto>>>;

public class ListElementsHandler : IRequestHandler<ListElementsQuery, Result<List<PageElementDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListElementsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<PageElementDto>>> Handle(ListElementsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<PageElementDto>>.Failure("Not authenticated", 401);

        var elements = await _db.Set<Domain.Entities.Website.PageElement>()
            .Where(e => e.PageId == request.PageId && e.PhotographerId == photographerId.Value)
            .OrderBy(e => e.SortOrder)
            .Select(e => new PageElementDto(
                e.Id, e.PageId, e.ElementType, e.ContentJson,
                e.PositionX, e.PositionY, e.Width, e.Height,
                e.ZIndex, e.SortOrder, e.ParentElementId,
                e.BreakpointOverrides.Select(o => new BreakpointOverrideDto(
                    o.Id, o.Breakpoint, o.PositionX, o.PositionY,
                    o.Width, o.Height, o.IsHidden, o.StyleOverridesJson)).ToList(),
                e.CreatedAt, e.UpdatedAt))
            .ToListAsync(ct);

        return Result<List<PageElementDto>>.Success(elements);
    }
}
