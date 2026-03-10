using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Elements;

/// <summary>
/// WEB-3.1.2 - Flex Editor: add elements via drag-and-drop.
/// WEB-3.2.2 Client Gallery Blocks, WEB-3.2.3 Instagram Feed,
/// WEB-3.2.4 Custom Embed Code, WEB-3.2.5 Landing Page Templates.
/// </summary>
public record CreateElementCommand(
    Guid PageId,
    ElementType ElementType,
    string? ContentJson,
    double PositionX,
    double PositionY,
    double Width,
    double Height,
    int? ZIndex,
    Guid? ParentElementId,
    List<CreateBreakpointOverride>? BreakpointOverrides) : IRequest<Result<PageElementDto>>;

public record CreateBreakpointOverride(
    Breakpoint Breakpoint,
    double? PositionX,
    double? PositionY,
    double? Width,
    double? Height,
    bool IsHidden,
    string? StyleOverridesJson);

public class CreateElementValidator : AbstractValidator<CreateElementCommand>
{
    public CreateElementValidator()
    {
        RuleFor(x => x.PageId).NotEmpty();
        RuleFor(x => x.Width).GreaterThan(0);
        RuleFor(x => x.Height).GreaterThan(0);
    }
}

public class CreateElementHandler : IRequestHandler<CreateElementCommand, Result<PageElementDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateElementHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PageElementDto>> Handle(CreateElementCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<PageElementDto>.Failure("Not authenticated", 401);

        var page = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.PhotographerId == photographerId.Value, ct);

        if (page is null)
            return Result<PageElementDto>.NotFound("Page not found");

        var maxSort = await _db.Set<Domain.Entities.Website.PageElement>()
            .Where(e => e.PageId == request.PageId)
            .MaxAsync(e => (int?)e.SortOrder, ct) ?? 0;

        var element = new Domain.Entities.Website.PageElement
        {
            PhotographerId = photographerId.Value,
            PageId = request.PageId,
            ElementType = request.ElementType,
            ContentJson = request.ContentJson,
            PositionX = request.PositionX,
            PositionY = request.PositionY,
            Width = request.Width,
            Height = request.Height,
            ZIndex = request.ZIndex ?? maxSort + 1,
            SortOrder = maxSort + 1,
            ParentElementId = request.ParentElementId
        };

        _db.Set<Domain.Entities.Website.PageElement>().Add(element);

        // Add breakpoint overrides (WEB-3.1.2)
        if (request.BreakpointOverrides != null)
        {
            foreach (var bo in request.BreakpointOverrides)
            {
                var over = new Domain.Entities.Website.ElementBreakpointOverride
                {
                    PageElementId = element.Id,
                    Breakpoint = bo.Breakpoint,
                    PositionX = bo.PositionX,
                    PositionY = bo.PositionY,
                    Width = bo.Width,
                    Height = bo.Height,
                    IsHidden = bo.IsHidden,
                    StyleOverridesJson = bo.StyleOverridesJson
                };
                _db.Set<Domain.Entities.Website.ElementBreakpointOverride>().Add(over);
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
