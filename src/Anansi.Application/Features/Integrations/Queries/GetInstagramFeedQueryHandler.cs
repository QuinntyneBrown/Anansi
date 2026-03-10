using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Queries;

public class GetInstagramFeedQueryHandler : IRequestHandler<GetInstagramFeedQuery, Result<IReadOnlyList<InstagramPost>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IInstagramService _instagramService;

    public GetInstagramFeedQueryHandler(IApplicationDbContext context, IInstagramService instagramService)
    {
        _context = context;
        _instagramService = instagramService;
    }

    public async Task<Result<IReadOnlyList<InstagramPost>>> Handle(GetInstagramFeedQuery request, CancellationToken cancellationToken)
    {
        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == request.PhotographerId, cancellationToken);

        if (photographer == null)
            return Result<IReadOnlyList<InstagramPost>>.NotFound("Photographer not found.");

        if (string.IsNullOrEmpty(photographer.InstagramAccessToken))
            return Result<IReadOnlyList<InstagramPost>>.Failure("Instagram not connected.");

        var config = await _context.InstagramFeedConfigs
            .FirstOrDefaultAsync(c => c.PhotographerId == request.PhotographerId, cancellationToken);

        var postCount = config?.NumberOfPosts ?? 9;

        var posts = await _instagramService.GetFeedAsync(photographer.InstagramAccessToken, postCount, cancellationToken);

        return Result<IReadOnlyList<InstagramPost>>.Success(posts);
    }
}
