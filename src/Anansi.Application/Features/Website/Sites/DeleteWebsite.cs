using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Sites;

public record DeleteWebsiteCommand(Guid WebsiteId) : IRequest<Result>;

public class DeleteWebsiteHandler : IRequestHandler<DeleteWebsiteCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteWebsiteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteWebsiteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);

        if (website is null)
            return Result.NotFound("Website not found");

        website.IsDeleted = true;
        website.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
