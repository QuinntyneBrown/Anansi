using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sharing;

// GAL-1.7.5: Gallery Embedding
public record GetEmbedCodeQuery(Guid CollectionId) : IRequest<Result<EmbedCodeResult>>;

public record EmbedCodeResult(
    string IframeCode,
    string JavaScriptCode
);

public class GetEmbedCodeHandler : IRequestHandler<GetEmbedCodeQuery, Result<EmbedCodeResult>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetEmbedCodeHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EmbedCodeResult>> Handle(GetEmbedCodeQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<EmbedCodeResult>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<EmbedCodeResult>.NotFound("Collection not found");

        if (!collection.EmbeddingEnabled)
            return Result<EmbedCodeResult>.Failure("Embedding is not enabled for this collection");

        var galleryUrl = $"/gallery/{collection.Slug}";
        var iframe = $"<iframe src=\"{galleryUrl}\" width=\"100%\" height=\"800\" frameborder=\"0\" allowfullscreen></iframe>";
        var jsSnippet = $"<script src=\"/embed.js\" data-collection=\"{collection.Id}\"></script>";

        return Result<EmbedCodeResult>.Success(new EmbedCodeResult(iframe, jsSnippet));
    }
}
