using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Downloads;

// GAL-1.4.1: Download Options, GAL-1.4.2: Download PIN, GAL-1.4.3: Download Limits, GAL-1.4.4: Async Download
public record RequestDownloadCommand(
    Guid CollectionId,
    DownloadResolution Resolution,
    bool IsFullGallery,
    List<Guid>? MediaIds,
    string? Pin,
    string? RequestedBy,
    string? RequestedByEmail
) : IRequest<Result<DownloadRequestDto>>;

public class RequestDownloadValidator : AbstractValidator<RequestDownloadCommand>
{
    public RequestDownloadValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x).Must(x => x.IsFullGallery || (x.MediaIds != null && x.MediaIds.Count > 0))
            .WithMessage("Must specify full gallery or individual media IDs");
    }
}

public class RequestDownloadHandler : IRequestHandler<RequestDownloadCommand, Result<DownloadRequestDto>>
{
    private readonly IApplicationDbContext _db;

    public RequestDownloadHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<DownloadRequestDto>> Handle(RequestDownloadCommand request, CancellationToken ct)
    {
        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId, ct);

        if (collection is null)
            return Result<DownloadRequestDto>.NotFound("Collection not found");

        if (!collection.DownloadsEnabled)
            return Result<DownloadRequestDto>.Failure("Downloads are not enabled for this collection");

        // Validate PIN (GAL-1.4.2)
        if (collection.DownloadPinEnabled && !string.IsNullOrEmpty(collection.DownloadPin))
        {
            if (string.IsNullOrEmpty(request.Pin) || request.Pin != collection.DownloadPin)
                return Result<DownloadRequestDto>.Failure("Invalid download PIN");
        }

        // Check download limits (GAL-1.4.3)
        if (collection.DownloadLimit.HasValue && collection.DownloadCount >= collection.DownloadLimit.Value)
            return Result<DownloadRequestDto>.Failure("Download limit has been reached for this collection");

        // Validate resolution (GAL-1.4.1)
        var allowedResolutions = collection.AllowedResolutions.Split(',', StringSplitOptions.RemoveEmptyEntries);
        if (!allowedResolutions.Contains(request.Resolution.ToString()))
            return Result<DownloadRequestDto>.Failure($"Resolution {request.Resolution} is not available for this collection");

        var downloadRequest = new DownloadRequest
        {
            PhotographerId = collection.PhotographerId,
            CollectionId = collection.Id,
            RequestedBy = request.RequestedBy,
            RequestedByEmail = request.RequestedByEmail,
            Resolution = request.Resolution,
            IsFullGallery = request.IsFullGallery,
            MediaIds = request.MediaIds != null ? string.Join(",", request.MediaIds) : null,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _db.DownloadRequests.Add(downloadRequest);
        collection.DownloadCount++;

        // Track activity (GAL-1.4.5)
        var activity = new GalleryActivity
        {
            PhotographerId = collection.PhotographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.Download,
            ActorName = request.RequestedBy,
            ActorEmail = request.RequestedByEmail,
            Resolution = request.Resolution,
            IsFullGallery = request.IsFullGallery,
            Details = request.IsFullGallery ? "Full gallery download" : $"Downloaded {request.MediaIds?.Count ?? 0} photos"
        };
        _db.GalleryActivities.Add(activity);

        await _db.SaveChangesAsync(ct);

        return Result<DownloadRequestDto>.Success(new DownloadRequestDto(
            downloadRequest.Id, downloadRequest.CollectionId,
            downloadRequest.RequestedBy, downloadRequest.RequestedByEmail,
            downloadRequest.Resolution, downloadRequest.IsFullGallery,
            downloadRequest.MediaIds, downloadRequest.IsReady,
            downloadRequest.ReadyAt, downloadRequest.ExpiresAt, downloadRequest.CreatedAt
        ));
    }
}
