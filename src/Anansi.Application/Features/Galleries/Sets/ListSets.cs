using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sets;

public record ListSetsQuery(Guid CollectionId) : IRequest<Result<List<CollectionSetDto>>>;

public class ListSetsHandler : IRequestHandler<ListSetsQuery, Result<List<CollectionSetDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListSetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CollectionSetDto>>> Handle(ListSetsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<CollectionSetDto>>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<List<CollectionSetDto>>.NotFound("Collection not found");

        var sets = await _db.CollectionSets
            .Where(s => s.CollectionId == request.CollectionId)
            .OrderBy(s => s.SortOrder)
            .Select(s => new CollectionSetDto(
                s.Id, s.CollectionId, s.Title, s.Description, s.SortOrder, s.IsClientExclusive, s.CreatedAt,
                s.Media.Count
            ))
            .ToListAsync(ct);

        return Result<List<CollectionSetDto>>.Success(sets);
    }
}
