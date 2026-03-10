using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Activities;

// GAL-1.9.2: Google Analytics Integration
public record SetGoogleAnalyticsCommand(
    Guid CollectionId,
    string? GoogleAnalyticsPropertyId
) : IRequest<Result>;

public class SetGoogleAnalyticsValidator : AbstractValidator<SetGoogleAnalyticsCommand>
{
    public SetGoogleAnalyticsValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.GoogleAnalyticsPropertyId).MaximumLength(100);
    }
}

public class SetGoogleAnalyticsHandler : IRequestHandler<SetGoogleAnalyticsCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SetGoogleAnalyticsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(SetGoogleAnalyticsCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result.NotFound("Collection not found");

        collection.GoogleAnalyticsPropertyId = request.GoogleAnalyticsPropertyId;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
