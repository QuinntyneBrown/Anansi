using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sets;

// GAL-1.2.1: Sets within Collections
public record CreateSetCommand(
    Guid CollectionId,
    string Title,
    string? Description,
    int SortOrder,
    bool IsClientExclusive
) : IRequest<Result<CollectionSetDto>>;

public class CreateSetValidator : AbstractValidator<CreateSetCommand>
{
    public CreateSetValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(5000);
    }
}

public class CreateSetHandler : IRequestHandler<CreateSetCommand, Result<CollectionSetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionSetDto>> Handle(CreateSetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionSetDto>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<CollectionSetDto>.NotFound("Collection not found");

        var set = new CollectionSet
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            CollectionId = request.CollectionId,
            Title = request.Title,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsClientExclusive = request.IsClientExclusive
        };

        _db.CollectionSets.Add(set);
        await _db.SaveChangesAsync(ct);

        return Result<CollectionSetDto>.Success(MapToDto(set, 0));
    }

    internal static CollectionSetDto MapToDto(CollectionSet s, int mediaCount) => new(
        s.Id, s.CollectionId, s.Title, s.Description, s.SortOrder, s.IsClientExclusive, s.CreatedAt, mediaCount
    );
}
