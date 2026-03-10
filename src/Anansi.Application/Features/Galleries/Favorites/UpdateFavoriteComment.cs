using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.2: Comments on Favorites
public record UpdateFavoriteCommentCommand(
    Guid FavoriteItemId,
    string Comment
) : IRequest<Result>;

public class UpdateFavoriteCommentValidator : AbstractValidator<UpdateFavoriteCommentCommand>
{
    public UpdateFavoriteCommentValidator()
    {
        RuleFor(x => x.FavoriteItemId).NotEmpty();
        RuleFor(x => x.Comment).MaximumLength(5000);
    }
}

public class UpdateFavoriteCommentHandler : IRequestHandler<UpdateFavoriteCommentCommand, Result>
{
    private readonly IApplicationDbContext _db;

    public UpdateFavoriteCommentHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(UpdateFavoriteCommentCommand request, CancellationToken ct)
    {
        var item = await _db.FavoriteItems
            .Include(i => i.FavoriteList)
            .FirstOrDefaultAsync(i => i.Id == request.FavoriteItemId, ct);

        if (item is null)
            return Result.NotFound("Favorite item not found");

        item.Comment = request.Comment;

        // Track comment activity
        var activity = new GalleryActivity
        {
            PhotographerId = item.FavoriteList.PhotographerId,
            CollectionId = item.FavoriteList.CollectionId,
            ActivityType = ActivityType.Comment,
            ActorName = item.FavoriteList.ClientName,
            ActorEmail = item.FavoriteList.ClientEmail,
            MediaId = item.MediaId,
            FavoriteListId = item.FavoriteListId,
            Details = request.Comment
        };
        _db.GalleryActivities.Add(activity);

        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
