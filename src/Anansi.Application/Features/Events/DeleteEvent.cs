using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Events;

/// <summary>
/// Soft-delete an own community event (EVT-24.3.2).
/// </summary>
public record DeleteEventCommand(Guid EventId) : IRequest<Result>;

public class DeleteEventHandler : IRequestHandler<DeleteEventCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteEventHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteEventCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var evt = await _db.Set<CommunityEvent>()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, ct);

        if (evt is null)
            return Result.NotFound("Event not found");

        if (evt.SubmittedByPhotographerId != photographerId)
            return Result.Forbidden("You can only delete your own events");

        evt.IsDeleted = true;
        evt.DeletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
