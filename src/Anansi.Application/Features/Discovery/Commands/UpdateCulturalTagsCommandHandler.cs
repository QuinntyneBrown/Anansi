using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Discovery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Commands;

public class UpdateCulturalTagsCommandHandler : IRequestHandler<UpdateCulturalTagsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCulturalTagsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateCulturalTagsCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographerId = _currentUser.PhotographerId.Value;

        // Deduplicate incoming tag names (case-insensitive)
        var requestedNames = request.Tags
            .Select(t => t.Trim())
            .Where(t => !string.IsNullOrEmpty(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedNames.Count > 20)
            return Result.Failure("Maximum 20 tags allowed.");

        // Find or create CulturalTag entities for each requested name
        var existingTags = await _context.CulturalTags.ToListAsync(cancellationToken);
        var tagIds = new List<Guid>();

        foreach (var name in requestedNames)
        {
            var existing = existingTags.FirstOrDefault(t =>
                string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));

            if (existing != null)
            {
                tagIds.Add(existing.Id);
            }
            else
            {
                var isSystem = PredefinedCulturalTags.All
                    .Any(p => string.Equals(p, name, StringComparison.OrdinalIgnoreCase));
                var newTag = new CulturalTag
                {
                    Name = name,
                    IsSystem = isSystem
                };
                _context.CulturalTags.Add(newTag);
                tagIds.Add(newTag.Id);
            }
        }

        // Remove existing associations for this photographer
        var existingAssociations = await _context.PhotographerCulturalTags
            .Where(pt => pt.PhotographerId == photographerId)
            .ToListAsync(cancellationToken);

        foreach (var assoc in existingAssociations)
            _context.PhotographerCulturalTags.Remove(assoc);

        // Create new associations
        foreach (var tagId in tagIds)
        {
            _context.PhotographerCulturalTags.Add(new PhotographerCulturalTag
            {
                PhotographerId = photographerId,
                CulturalTagId = tagId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
