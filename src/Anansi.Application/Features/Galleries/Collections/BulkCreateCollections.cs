using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

// GAL-1.2.2: Bulk Gallery Creation
public record BulkCreateCollectionsCommand(
    List<BulkCollectionItem> Collections,
    Guid? PresetId
) : IRequest<Result<List<CollectionSummaryDto>>>;

public record BulkCollectionItem(
    string Title,
    string? ClientName,
    string? ClientEmail
);

public class BulkCreateCollectionsValidator : AbstractValidator<BulkCreateCollectionsCommand>
{
    public BulkCreateCollectionsValidator()
    {
        RuleFor(x => x.Collections).NotEmpty();
        RuleForEach(x => x.Collections).ChildRules(c =>
        {
            c.RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
            c.RuleFor(x => x.ClientEmail).MaximumLength(500);
        });
    }
}

public class BulkCreateCollectionsHandler : IRequestHandler<BulkCreateCollectionsCommand, Result<List<CollectionSummaryDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public BulkCreateCollectionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CollectionSummaryDto>>> Handle(BulkCreateCollectionsCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<CollectionSummaryDto>>.Forbidden("Not authenticated");

        var photographerId = _currentUser.PhotographerId.Value;

        CollectionPreset? preset = null;
        if (request.PresetId.HasValue)
        {
            preset = await _db.CollectionPresets
                .FirstOrDefaultAsync(p => p.Id == request.PresetId.Value && p.PhotographerId == photographerId, ct);
        }

        var collections = new List<Collection>();
        foreach (var item in request.Collections)
        {
            var slug = item.Title.ToLowerInvariant().Replace(" ", "-").Replace("'", "").Replace("\"", "")
                       + "-" + Guid.NewGuid().ToString("N")[..8];

            var collection = new Collection
            {
                PhotographerId = photographerId,
                Title = item.Title,
                Slug = slug,
                Status = CollectionStatus.Draft,
                DownloadPin = Random.Shared.Next(1000, 9999).ToString()
            };

            if (preset != null)
            {
                collection.CoverStyle = preset.CoverStyle;
                collection.Theme = preset.Theme;
                collection.FontFamily = preset.FontFamily;
                collection.ColorPalette = preset.ColorPalette;
                collection.CustomColorHex = preset.CustomColorHex;
                collection.Layout = preset.Layout;
                collection.DownloadsEnabled = preset.DownloadsEnabled;
                collection.DownloadPinEnabled = preset.DownloadPinEnabled;
                collection.AllowedResolutions = preset.AllowedResolutions;
                collection.RequireEmailRegistration = preset.RequireEmailRegistration;
                collection.Language = preset.Language;
                collection.PresetId = preset.Id;
            }

            collections.Add(collection);
            _db.Collections.Add(collection);
        }

        await _db.SaveChangesAsync(ct);

        var result = collections.Select(c => new CollectionSummaryDto(
            c.Id, c.Title, c.Slug, c.Status, c.CoverStyle, c.IsStarred, c.Language, c.CreatedAt, 0, 0
        )).ToList();

        return Result<List<CollectionSummaryDto>>.Success(result);
    }
}
