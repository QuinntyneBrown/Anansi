using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Templates;

/// <summary>
/// WEB-3.1.1 - Template preview before selection.
/// </summary>
public record GetTemplatePreviewQuery(Guid TemplateId) : IRequest<Result<WebsiteTemplateDto>>;

public class GetTemplatePreviewHandler : IRequestHandler<GetTemplatePreviewQuery, Result<WebsiteTemplateDto>>
{
    private readonly IApplicationDbContext _db;

    public GetTemplatePreviewHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result<WebsiteTemplateDto>> Handle(GetTemplatePreviewQuery request, CancellationToken ct)
    {
        var template = await _db.Set<Domain.Entities.Website.WebsiteTemplate>()
            .Where(t => t.Id == request.TemplateId && t.IsActive)
            .Select(t => new WebsiteTemplateDto(
                t.Id, t.Name, t.Description, t.Category,
                t.PreviewImageUrl, t.ThumbnailUrl, t.IsActive, t.SortOrder))
            .FirstOrDefaultAsync(ct);

        return template is null
            ? Result<WebsiteTemplateDto>.NotFound("Template not found")
            : Result<WebsiteTemplateDto>.Success(template);
    }
}
