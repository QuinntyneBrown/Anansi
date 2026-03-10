using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Seo;

/// <summary>
/// WEB-3.5.3 - AI Page Descriptions: generate meta descriptions based on page content.
/// </summary>
public record GenerateAiDescriptionCommand(Guid PageId) : IRequest<Result<string>>;

public class GenerateAiDescriptionHandler : IRequestHandler<GenerateAiDescriptionCommand, Result<string>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GenerateAiDescriptionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<string>> Handle(GenerateAiDescriptionCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<string>.Failure("Not authenticated", 401);

        var page = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.PhotographerId == photographerId.Value, ct);
        if (page is null)
            return Result<string>.NotFound("Page not found");

        // AI generation placeholder
        var description = $"Professional photography page: {page.Title}. Visit to explore our photography services and portfolio.";

        return Result<string>.Success(description);
    }
}
