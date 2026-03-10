using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.1: Add to favorites, GAL-1.5.4: Favorite Limits
public record AddFavoriteItemCommand(
    Guid FavoriteListId,
    Guid MediaId,
    string? Comment
) : IRequest<Result<FavoriteItemDto>>;

public class AddFavoriteItemValidator : AbstractValidator<AddFavoriteItemCommand>
{
    public AddFavoriteItemValidator()
    {
        RuleFor(x => x.FavoriteListId).NotEmpty();
        RuleFor(x => x.MediaId).NotEmpty();
        RuleFor(x => x.Comment).MaximumLength(5000);
    }
}

public class AddFavoriteItemHandler : IRequestHandler<AddFavoriteItemCommand, Result<FavoriteItemDto>>
{
    private readonly IApplicationDbContext _db;

    public AddFavoriteItemHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<FavoriteItemDto>> Handle(AddFavoriteItemCommand request, CancellationToken ct)
    {
        var favoriteList = await _db.FavoriteLists
            .Include(f => f.Items)
            .FirstOrDefaultAsync(f => f.Id == request.FavoriteListId, ct);

        if (favoriteList is null)
            return Result<FavoriteItemDto>.NotFound("Favorite list not found");

        // Check collection favorite limit (GAL-1.5.4)
        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == favoriteList.CollectionId, ct);

        if (collection?.FavoriteLimit.HasValue == true)
        {
            var currentCount = favoriteList.Items.Count;
            if (currentCount >= collection.FavoriteLimit.Value)
                return Result<FavoriteItemDto>.Failure(
                    $"Favorite limit of {collection.FavoriteLimit.Value} has been reached. Remove photos to make room for new selections.");
        }

        // Check duplicate
        if (favoriteList.Items.Any(i => i.MediaId == request.MediaId))
            return Result<FavoriteItemDto>.Failure("Photo is already in this favorite list");

        var item = new FavoriteItem
        {
            FavoriteListId = request.FavoriteListId,
            MediaId = request.MediaId,
            Comment = request.Comment
        };

        _db.FavoriteItems.Add(item);

        // Track activity
        var activity = new GalleryActivity
        {
            PhotographerId = favoriteList.PhotographerId,
            CollectionId = favoriteList.CollectionId,
            ActivityType = ActivityType.Favorite,
            ActorName = favoriteList.ClientName,
            ActorEmail = favoriteList.ClientEmail,
            MediaId = request.MediaId,
            FavoriteListId = favoriteList.Id,
            Details = $"Added to '{favoriteList.Name}'"
        };
        _db.GalleryActivities.Add(activity);

        await _db.SaveChangesAsync(ct);

        var media = await _db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == request.MediaId, ct);

        return Result<FavoriteItemDto>.Success(new FavoriteItemDto(
            item.Id, item.FavoriteListId, item.MediaId,
            item.Comment, media?.FileName, item.CreatedAt
        ));
    }
}
