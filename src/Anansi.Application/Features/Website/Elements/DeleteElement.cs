using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Elements;

/// <summary>
/// WEB-3.1.2 - Flex Editor: remove elements.
/// </summary>
public record DeleteElementCommand(Guid ElementId) : IRequest<Result>;

public class DeleteElementHandler : IRequestHandler<DeleteElementCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteElementHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteElementCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var element = await _db.Set<Domain.Entities.Website.PageElement>()
            .FirstOrDefaultAsync(e => e.Id == request.ElementId && e.PhotographerId == photographerId.Value, ct);

        if (element is null)
            return Result.NotFound("Element not found");

        _db.Set<Domain.Entities.Website.PageElement>().Remove(element);
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
