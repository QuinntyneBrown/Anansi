using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sets;

// GAL-1.2.1: Manually sortable sets
public record ReorderSetsCommand(
    Guid CollectionId,
    List<Guid> SetIdsInOrder
) : IRequest<Result>;

public class ReorderSetsHandler : IRequestHandler<ReorderSetsCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ReorderSetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ReorderSetsCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var sets = await _db.CollectionSets
            .Where(s => s.CollectionId == request.CollectionId && s.PhotographerId == _currentUser.PhotographerId.Value)
            .ToListAsync(ct);

        for (int i = 0; i < request.SetIdsInOrder.Count; i++)
        {
            var set = sets.FirstOrDefault(s => s.Id == request.SetIdsInOrder[i]);
            if (set != null)
                set.SortOrder = i;
        }

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
