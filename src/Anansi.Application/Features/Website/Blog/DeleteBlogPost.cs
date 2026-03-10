using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

public record DeleteBlogPostCommand(Guid BlogPostId) : IRequest<Result>;

public class DeleteBlogPostHandler : IRequestHandler<DeleteBlogPostCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteBlogPostHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteBlogPostCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var post = await _db.Set<Domain.Entities.Website.BlogPost>()
            .FirstOrDefaultAsync(p => p.Id == request.BlogPostId && p.PhotographerId == photographerId.Value, ct);
        if (post is null)
            return Result.NotFound("Blog post not found");

        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
