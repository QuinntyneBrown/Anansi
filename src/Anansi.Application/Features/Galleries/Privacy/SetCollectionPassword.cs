using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.1: Collection Password, GAL-1.6.2: Client Exclusive Access
public record SetCollectionPasswordCommand(
    Guid CollectionId,
    string? Password,
    string? ClientExclusivePassword
) : IRequest<Result>;

public class SetCollectionPasswordHandler : IRequestHandler<SetCollectionPasswordCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SetCollectionPasswordHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(SetCollectionPasswordCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result.NotFound("Collection not found");

        collection.Password = request.Password;
        collection.ClientExclusivePassword = request.ClientExclusivePassword;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
