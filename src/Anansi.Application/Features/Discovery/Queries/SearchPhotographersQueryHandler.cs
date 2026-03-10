using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Discovery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Queries;

public class SearchPhotographersQueryHandler
    : IRequestHandler<SearchPhotographersQuery, Result<SearchPhotographersResult>>
{
    private const int PageSize = 20;
    private readonly IApplicationDbContext _context;

    public SearchPhotographersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SearchPhotographersResult>> Handle(
        SearchPhotographersQuery request, CancellationToken cancellationToken)
    {
        var searchTags = request.Tags?
            .Select(t => t.Trim())
            .Where(t => !string.IsNullOrEmpty(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? new List<string>();

        var searchNeighborhood = request.Neighborhood?.Trim();
        var hasTagSearch = searchTags.Count > 0;
        var hasNeighborhoodSearch = !string.IsNullOrEmpty(searchNeighborhood);

        if (!hasTagSearch && !hasNeighborhoodSearch)
            return Result<SearchPhotographersResult>.Failure(
                "At least one search criteria (tags or neighborhood) is required.");

        // Resolve target neighborhood coordinates for distance calculation
        double? targetLat = null;
        double? targetLon = null;

        if (hasNeighborhoodSearch)
        {
            var predefined = PredefinedNeighborhoods.All
                .FirstOrDefault(n => string.Equals(n.Name, searchNeighborhood, StringComparison.OrdinalIgnoreCase));

            if (predefined != null)
            {
                targetLat = predefined.Latitude;
                targetLon = predefined.Longitude;
            }
            else
            {
                // Look up from service areas that match the neighborhood name
                var matchingArea = await _context.PhotographerServiceAreas
                    .FirstOrDefaultAsync(sa => sa.Neighborhood == searchNeighborhood, cancellationToken);

                if (matchingArea != null)
                {
                    targetLat = matchingArea.Latitude;
                    targetLon = matchingArea.Longitude;
                }
            }
        }

        // Resolve tag IDs for matching
        var matchingTagIds = new List<Guid>();
        if (hasTagSearch)
        {
            matchingTagIds = await _context.CulturalTags
                .Where(t => searchTags.Contains(t.Name))
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);
        }

        // Build candidate photographer IDs
        HashSet<Guid>? tagMatchPhotographerIds = null;
        Dictionary<Guid, int> tagMatchCounts = new();

        if (hasTagSearch && matchingTagIds.Count > 0)
        {
            var photographerTagData = await _context.PhotographerCulturalTags
                .Where(pt => matchingTagIds.Contains(pt.CulturalTagId))
                .GroupBy(pt => pt.PhotographerId)
                .Select(g => new { PhotographerId = g.Key, MatchCount = g.Count() })
                .ToListAsync(cancellationToken);

            tagMatchPhotographerIds = photographerTagData.Select(x => x.PhotographerId).ToHashSet();
            tagMatchCounts = photographerTagData.ToDictionary(x => x.PhotographerId, x => x.MatchCount);
        }
        else if (hasTagSearch)
        {
            // Tags were specified but none matched any existing tags
            return Result<SearchPhotographersResult>.Success(new SearchPhotographersResult(
                new List<SearchPhotographerDto>(), 0, request.Page, PageSize));
        }

        // Get photographers with service areas in the neighborhood bounding box
        HashSet<Guid>? neighborhoodPhotographerIds = null;
        Dictionary<Guid, (double Lat, double Lon, int RadiusKm, string Neighborhood)> serviceAreaMap = new();

        if (hasNeighborhoodSearch && targetLat.HasValue && targetLon.HasValue)
        {
            // Use generous bounding box (100km max radius) for pre-filtering
            var bbox = HaversineHelper.GetBoundingBox(targetLat.Value, targetLon.Value, 100);

            var candidateAreas = await _context.PhotographerServiceAreas
                .Where(sa => sa.Latitude >= bbox.MinLat && sa.Latitude <= bbox.MaxLat
                          && sa.Longitude >= bbox.MinLon && sa.Longitude <= bbox.MaxLon)
                .ToListAsync(cancellationToken);

            // Filter by actual Haversine distance vs photographer's radius
            var validAreas = candidateAreas
                .Where(sa =>
                {
                    var distance = HaversineHelper.CalculateDistanceKm(
                        sa.Latitude, sa.Longitude, targetLat.Value, targetLon.Value);
                    return distance <= sa.RadiusKm;
                })
                .ToList();

            neighborhoodPhotographerIds = validAreas.Select(sa => sa.PhotographerId).ToHashSet();
            serviceAreaMap = validAreas.ToDictionary(
                sa => sa.PhotographerId,
                sa => (sa.Latitude, sa.Longitude, sa.RadiusKm, sa.Neighborhood));

            // Also include photographers whose service area neighborhood name matches
            var nameMatchAreas = await _context.PhotographerServiceAreas
                .Where(sa => sa.Neighborhood == searchNeighborhood)
                .ToListAsync(cancellationToken);

            foreach (var sa in nameMatchAreas)
            {
                neighborhoodPhotographerIds.Add(sa.PhotographerId);
                serviceAreaMap.TryAdd(sa.PhotographerId, (sa.Latitude, sa.Longitude, sa.RadiusKm, sa.Neighborhood));
            }
        }
        else if (hasNeighborhoodSearch)
        {
            // Neighborhood specified but unknown -- match by name only
            var nameMatchAreas = await _context.PhotographerServiceAreas
                .Where(sa => sa.Neighborhood == searchNeighborhood)
                .ToListAsync(cancellationToken);

            neighborhoodPhotographerIds = nameMatchAreas.Select(sa => sa.PhotographerId).ToHashSet();
            serviceAreaMap = nameMatchAreas.ToDictionary(
                sa => sa.PhotographerId,
                sa => (sa.Latitude, sa.Longitude, sa.RadiusKm, sa.Neighborhood));
        }

        // Combine results
        HashSet<Guid> candidateIds;
        if (hasTagSearch && hasNeighborhoodSearch)
        {
            // Intersection -- must match both
            candidateIds = tagMatchPhotographerIds!;
            candidateIds.IntersectWith(neighborhoodPhotographerIds!);
        }
        else if (hasTagSearch)
        {
            candidateIds = tagMatchPhotographerIds!;
        }
        else
        {
            candidateIds = neighborhoodPhotographerIds!;
        }

        if (candidateIds.Count == 0)
        {
            return Result<SearchPhotographersResult>.Success(new SearchPhotographersResult(
                new List<SearchPhotographerDto>(), 0, request.Page, PageSize));
        }

        // Load photographer data
        var photographers = await _context.Photographers
            .Where(p => candidateIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        // Load all tags for these photographers
        var photographerTags = await _context.PhotographerCulturalTags
            .Where(pt => candidateIds.Contains(pt.PhotographerId))
            .Include(pt => pt.CulturalTag)
            .ToListAsync(cancellationToken);

        var tagsByPhotographer = photographerTags
            .GroupBy(pt => pt.PhotographerId)
            .ToDictionary(g => g.Key, g => g.Select(pt => pt.CulturalTag.Name).ToList());

        // Load service areas for photographers that we haven't loaded yet
        if (!hasNeighborhoodSearch)
        {
            var missingIds = candidateIds.Where(id => !serviceAreaMap.ContainsKey(id)).ToList();
            if (missingIds.Count > 0)
            {
                var areas = await _context.PhotographerServiceAreas
                    .Where(sa => missingIds.Contains(sa.PhotographerId))
                    .ToListAsync(cancellationToken);
                foreach (var sa in areas)
                    serviceAreaMap.TryAdd(sa.PhotographerId, (sa.Latitude, sa.Longitude, sa.RadiusKm, sa.Neighborhood));
            }
        }

        // Build result DTOs with relevance scoring
        var results = new List<SearchPhotographerDto>();
        foreach (var photographer in photographers)
        {
            tagMatchCounts.TryGetValue(photographer.Id, out var matchCount);
            tagsByPhotographer.TryGetValue(photographer.Id, out var tags);
            serviceAreaMap.TryGetValue(photographer.Id, out var area);

            double? distanceKm = null;
            if (targetLat.HasValue && targetLon.HasValue && area != default)
            {
                distanceKm = Math.Round(HaversineHelper.CalculateDistanceKm(
                    area.Lat, area.Lon, targetLat.Value, targetLon.Value), 1);
            }

            // Relevance: tag match count (weighted higher) + distance proximity bonus
            double relevance = matchCount * 10.0;
            if (hasNeighborhoodSearch && distanceKm.HasValue)
            {
                // Closer = higher score, max bonus of 5 at 0 km
                relevance += Math.Max(0, 5.0 - (distanceKm.Value / 20.0));
            }

            results.Add(new SearchPhotographerDto(
                photographer.Id,
                photographer.FirstName,
                photographer.LastName,
                photographer.BusinessName,
                photographer.ProfileIconUrl,
                tags ?? new List<string>(),
                area != default ? area.Neighborhood : null,
                distanceKm,
                Math.Round(relevance, 1)));
        }

        // Sort: by relevance descending, then by distance ascending
        var sorted = results
            .OrderByDescending(r => r.RelevanceScore)
            .ThenBy(r => r.DistanceKm ?? double.MaxValue)
            .ToList();

        var totalCount = sorted.Count;
        var page = Math.Max(1, request.Page);
        var pagedItems = sorted
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
            .ToList();

        return Result<SearchPhotographersResult>.Success(
            new SearchPhotographersResult(pagedItems, totalCount, page, PageSize));
    }
}
