using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Discovery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Queries;

public class ListAvailableCulturalTagsQueryHandler
    : IRequestHandler<ListAvailableCulturalTagsQuery, Result<List<AvailableTagDto>>>
{
    private readonly IApplicationDbContext _context;

    public ListAvailableCulturalTagsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<AvailableTagDto>>> Handle(
        ListAvailableCulturalTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _context.CulturalTags.ToListAsync(cancellationToken);
        var usageCounts = await _context.PhotographerCulturalTags
            .GroupBy(pt => pt.CulturalTagId)
            .Select(g => new { TagId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var usageMap = usageCounts.ToDictionary(u => u.TagId, u => u.Count);

        var results = new List<AvailableTagDto>();
        foreach (var tag in tags)
        {
            usageMap.TryGetValue(tag.Id, out var count);

            // System tags are always visible; custom tags only if used by 3+ photographers
            if (tag.IsSystem || count >= 3)
            {
                results.Add(new AvailableTagDto(tag.Name, count, tag.IsSystem));
            }
        }

        return Result<List<AvailableTagDto>>.Success(
            results.OrderByDescending(r => r.UsageCount).ThenBy(r => r.Name).ToList());
    }
}
