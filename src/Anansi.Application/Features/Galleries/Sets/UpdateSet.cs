using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sets;

// GAL-1.3.7: Set Titles & Descriptions
public record UpdateSetCommand(
    Guid Id,
    string Title,
    string? Description,
    int SortOrder,
    bool IsClientExclusive
) : IRequest<Result<CollectionSetDto>>;

public class UpdateSetValidator : AbstractValidator<UpdateSetCommand>
{
    public UpdateSetValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(5000);
    }
}

public class UpdateSetHandler : IRequestHandler<UpdateSetCommand, Result<CollectionSetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateSetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionSetDto>> Handle(UpdateSetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionSetDto>.Forbidden("Not authenticated");

        var set = await _db.CollectionSets
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (set is null)
            return Result<CollectionSetDto>.NotFound("Set not found");

        set.Title = request.Title;
        set.Description = request.Description;
        set.SortOrder = request.SortOrder;
        set.IsClientExclusive = request.IsClientExclusive;

        await _db.SaveChangesAsync(ct);

        var mediaCount = await _db.GalleryMedia.CountAsync(m => m.SetId == set.Id, ct);
        return Result<CollectionSetDto>.Success(CreateSetHandler.MapToDto(set, mediaCount));
    }
}
