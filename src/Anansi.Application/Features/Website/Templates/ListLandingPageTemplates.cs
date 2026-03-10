using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Templates;

/// <summary>
/// WEB-3.2.5 - Landing Page Templates: ready-made templates for one-click addition.
/// </summary>
public record ListLandingPageTemplatesQuery : IRequest<Result<List<LandingPageTemplateDto>>>;

public class ListLandingPageTemplatesHandler : IRequestHandler<ListLandingPageTemplatesQuery, Result<List<LandingPageTemplateDto>>>
{
    private readonly IApplicationDbContext _db;

    public ListLandingPageTemplatesHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result<List<LandingPageTemplateDto>>> Handle(ListLandingPageTemplatesQuery request, CancellationToken ct)
    {
        var templates = await _db.Set<Domain.Entities.Website.LandingPageTemplate>()
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .Select(t => new LandingPageTemplateDto(
                t.Id, t.Name, t.Description, t.UseCase, t.PreviewImageUrl, t.IsActive, t.SortOrder))
            .ToListAsync(ct);

        return Result<List<LandingPageTemplateDto>>.Success(templates);
    }
}
