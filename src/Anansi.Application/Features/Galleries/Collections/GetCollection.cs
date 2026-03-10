using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

public record GetCollectionQuery(Guid Id) : IRequest<Result<CollectionDto>>;

public class GetCollectionHandler : IRequestHandler<GetCollectionQuery, Result<CollectionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCollectionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionDto>> Handle(GetCollectionQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionDto>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<CollectionDto>.NotFound("Collection not found");

        var setCount = await _db.CollectionSets.CountAsync(s => s.CollectionId == collection.Id, ct);
        var mediaCount = await _db.GalleryMedia.CountAsync(m => m.CollectionId == collection.Id, ct);

        return Result<CollectionDto>.Success(CreateCollectionHandler.MapToDto(collection, setCount, mediaCount));
    }
}
