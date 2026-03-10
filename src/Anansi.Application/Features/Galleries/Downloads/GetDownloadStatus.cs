using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Downloads;

// GAL-1.4.4: Async Download status check
public record GetDownloadStatusQuery(Guid DownloadRequestId) : IRequest<Result<DownloadRequestDto>>;

public class GetDownloadStatusHandler : IRequestHandler<GetDownloadStatusQuery, Result<DownloadRequestDto>>
{
    private readonly IApplicationDbContext _db;

    public GetDownloadStatusHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<DownloadRequestDto>> Handle(GetDownloadStatusQuery request, CancellationToken ct)
    {
        var dr = await _db.DownloadRequests
            .FirstOrDefaultAsync(d => d.Id == request.DownloadRequestId, ct);

        if (dr is null)
            return Result<DownloadRequestDto>.NotFound("Download request not found");

        return Result<DownloadRequestDto>.Success(new DownloadRequestDto(
            dr.Id, dr.CollectionId, dr.RequestedBy, dr.RequestedByEmail,
            dr.Resolution, dr.IsFullGallery, dr.MediaIds,
            dr.IsReady, dr.ReadyAt, dr.ExpiresAt, dr.CreatedAt
        ));
    }
}
