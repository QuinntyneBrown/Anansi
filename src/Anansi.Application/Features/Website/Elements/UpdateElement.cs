using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Elements;

/// <summary>
/// WEB-3.1.2 - Flex Editor: resize, reposition, layer management (bring to front/send to back).
/// </summary>
public record UpdateElementCommand(
    Guid ElementId,
    string? ContentJson,
    double? PositionX,
    double? PositionY,
    double? Width,
    double? Height,
    int? ZIndex,
    int? SortOrder,
    List<CreateBreakpointOverride>? BreakpointOverrides) : IRequest<Result<PageElementDto>>;

public class UpdateElementHandler : IRequestHandler<UpdateElementCommand, Result<PageElementDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateElementHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PageElementDto>> Handle(UpdateElementCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<PageElementDto>.Failure("Not authenticated", 401);

        var element = await _db.Set<Domain.Entities.Website.PageElement>()
            .FirstOrDefaultAsync(e => e.Id == request.ElementId && e.PhotographerId == photographerId.Value, ct);

        if (element is null)
            return Result<PageElementDto>.NotFound("Element not found");

        if (request.ContentJson != null) element.ContentJson = request.ContentJson;
        if (request.PositionX.HasValue) element.PositionX = request.PositionX.Value;
        if (request.PositionY.HasValue) element.PositionY = request.PositionY.Value;
        if (request.Width.HasValue) element.Width = request.Width.Value;
        if (request.Height.HasValue) element.Height = request.Height.Value;
        if (request.ZIndex.HasValue) element.ZIndex = request.ZIndex.Value;
        if (request.SortOrder.HasValue) element.SortOrder = request.SortOrder.Value;

        // Update breakpoint overrides
        if (request.BreakpointOverrides != null)
        {
            var existing = await _db.Set<Domain.Entities.Website.ElementBreakpointOverride>()
                .Where(o => o.PageElementId == element.Id)
                .ToListAsync(ct);

            // Remove old overrides
            foreach (var old in existing)
                _db.Set<Domain.Entities.Website.ElementBreakpointOverride>().Remove(old);

            // Add new overrides
            foreach (var bo in request.BreakpointOverrides)
            {
                _db.Set<Domain.Entities.Website.ElementBreakpointOverride>().Add(new Domain.Entities.Website.ElementBreakpointOverride
                {
                    PageElementId = element.Id,
                    Breakpoint = bo.Breakpoint,
                    PositionX = bo.PositionX,
                    PositionY = bo.PositionY,
                    Width = bo.Width,
                    Height = bo.Height,
                    IsHidden = bo.IsHidden,
                    StyleOverridesJson = bo.StyleOverridesJson
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        var overrides = await _db.Set<Domain.Entities.Website.ElementBreakpointOverride>()
            .Where(o => o.PageElementId == element.Id)
            .Select(o => new BreakpointOverrideDto(o.Id, o.Breakpoint, o.PositionX, o.PositionY, o.Width, o.Height, o.IsHidden, o.StyleOverridesJson))
            .ToListAsync(ct);

        return Result<PageElementDto>.Success(new PageElementDto(
            element.Id, element.PageId, element.ElementType, element.ContentJson,
            element.PositionX, element.PositionY, element.Width, element.Height,
            element.ZIndex, element.SortOrder, element.ParentElementId,
            overrides, element.CreatedAt, element.UpdatedAt));
    }
}
