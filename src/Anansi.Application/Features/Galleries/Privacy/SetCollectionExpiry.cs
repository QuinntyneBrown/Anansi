using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.6: Collection Expiration, GAL-1.6.7: Auto Expiry Reminder Emails
public record SetCollectionExpiryCommand(
    Guid CollectionId,
    DateTime? ExpiresAt,
    string? ReminderRecipients,
    string? ReminderDays,
    string? ReminderEmailTemplate
) : IRequest<Result>;

public class SetCollectionExpiryHandler : IRequestHandler<SetCollectionExpiryCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SetCollectionExpiryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(SetCollectionExpiryCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result.NotFound("Collection not found");

        collection.ExpiresAt = request.ExpiresAt;
        collection.ExpiryReminderRecipients = request.ReminderRecipients;
        collection.ExpiryReminderDays = request.ReminderDays;
        collection.ExpiryReminderEmailTemplate = request.ReminderEmailTemplate;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
