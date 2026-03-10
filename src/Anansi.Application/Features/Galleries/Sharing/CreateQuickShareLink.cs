using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sharing;

// GAL-1.7.3: Quick Share
public record CreateQuickShareLinkCommand(
    Guid CollectionId,
    List<Guid> MediaIds
) : IRequest<Result<QuickShareLinkDto>>;

public class CreateQuickShareLinkValidator : AbstractValidator<CreateQuickShareLinkCommand>
{
    public CreateQuickShareLinkValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.MediaIds).NotEmpty();
    }
}

public class CreateQuickShareLinkHandler : IRequestHandler<CreateQuickShareLinkCommand, Result<QuickShareLinkDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateQuickShareLinkHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuickShareLinkDto>> Handle(CreateQuickShareLinkCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<QuickShareLinkDto>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<QuickShareLinkDto>.NotFound("Collection not found");

        var link = new QuickShareLink
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            CollectionId = request.CollectionId,
            Token = Guid.NewGuid().ToString("N"),
            MediaIds = string.Join(",", request.MediaIds)
        };

        _db.QuickShareLinks.Add(link);
        await _db.SaveChangesAsync(ct);

        return Result<QuickShareLinkDto>.Success(new QuickShareLinkDto(
            link.Id, link.CollectionId, link.Token, link.MediaIds, link.IsRevoked, link.CreatedAt
        ));
    }
}
