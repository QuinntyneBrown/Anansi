using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.1: Favorite Lists, GAL-1.5.3: Preset Favorite Lists
public record CreateFavoriteListCommand(
    Guid CollectionId,
    string Name,
    string? ClientName,
    string? ClientEmail,
    bool IsPreset
) : IRequest<Result<FavoriteListDto>>;

public class CreateFavoriteListValidator : AbstractValidator<CreateFavoriteListCommand>
{
    public CreateFavoriteListValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
    }
}

public class CreateFavoriteListHandler : IRequestHandler<CreateFavoriteListCommand, Result<FavoriteListDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateFavoriteListHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<FavoriteListDto>> Handle(CreateFavoriteListCommand request, CancellationToken ct)
    {
        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId, ct);

        if (collection is null)
            return Result<FavoriteListDto>.NotFound("Collection not found");

        var favoriteList = new FavoriteList
        {
            PhotographerId = collection.PhotographerId,
            CollectionId = request.CollectionId,
            Name = request.Name,
            ClientName = request.ClientName,
            ClientEmail = request.ClientEmail,
            IsPreset = request.IsPreset,
            ShareToken = Guid.NewGuid().ToString("N")[..16]
        };

        _db.FavoriteLists.Add(favoriteList);
        await _db.SaveChangesAsync(ct);

        return Result<FavoriteListDto>.Success(new FavoriteListDto(
            favoriteList.Id, favoriteList.CollectionId, favoriteList.Name,
            favoriteList.ClientName, favoriteList.ClientEmail,
            favoriteList.IsPreset, favoriteList.IsCompleted,
            favoriteList.ShareToken, 0, favoriteList.CreatedAt, favoriteList.UpdatedAt
        ));
    }
}
