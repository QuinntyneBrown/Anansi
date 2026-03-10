using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Pages;

/// <summary>
/// WEB-3.2.1 - Page Management: removable pages.
/// </summary>
public record DeletePageCommand(Guid PageId) : IRequest<Result>;

public class DeletePageHandler : IRequestHandler<DeletePageCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeletePageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeletePageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var page = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.PhotographerId == photographerId.Value, ct);

        if (page is null)
            return Result.NotFound("Page not found");

        page.IsDeleted = true;
        page.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
