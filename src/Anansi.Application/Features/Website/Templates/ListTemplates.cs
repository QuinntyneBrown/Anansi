using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Templates;

/// <summary>
/// WEB-3.1.1 - Template Library: list all templates with optional category filter.
/// </summary>
public record ListTemplatesQuery(TemplateCategory? Category = null) : IRequest<Result<List<WebsiteTemplateDto>>>;

public class ListTemplatesHandler : IRequestHandler<ListTemplatesQuery, Result<List<WebsiteTemplateDto>>>
{
    private readonly IApplicationDbContext _db;

    public ListTemplatesHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result<List<WebsiteTemplateDto>>> Handle(ListTemplatesQuery request, CancellationToken ct)
    {
        var query = _db.Set<Domain.Entities.Website.WebsiteTemplate>()
            .Where(t => t.IsActive);

        if (request.Category.HasValue)
            query = query.Where(t => t.Category == request.Category.Value);

        var templates = await query
            .OrderBy(t => t.SortOrder)
            .Select(t => new WebsiteTemplateDto(
                t.Id, t.Name, t.Description, t.Category,
                t.PreviewImageUrl, t.ThumbnailUrl, t.IsActive, t.SortOrder))
            .ToListAsync(ct);

        return Result<List<WebsiteTemplateDto>>.Success(templates);
    }
}
