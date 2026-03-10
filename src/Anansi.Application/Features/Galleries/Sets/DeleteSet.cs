using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sets;

public record DeleteSetCommand(Guid Id) : IRequest<Result>;

public class DeleteSetHandler : IRequestHandler<DeleteSetCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteSetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteSetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var set = await _db.CollectionSets
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (set is null)
            return Result.NotFound("Set not found");

        set.IsDeleted = true;
        set.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
