using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Anansi.Application.Features.Galleries.Activities;

// GAL-1.4.5: CSV export of download activity, GAL-1.9.1
public record ExportActivityCsvQuery(
    Guid CollectionId,
    ActivityType? Type = null,
    DateTime? From = null,
    DateTime? To = null
) : IRequest<Result<byte[]>>;

public class ExportActivityCsvHandler : IRequestHandler<ExportActivityCsvQuery, Result<byte[]>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ExportActivityCsvHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<byte[]>> Handle(ExportActivityCsvQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<byte[]>.Forbidden("Not authenticated");

        var query = _db.GalleryActivities
            .Where(a => a.CollectionId == request.CollectionId
                        && a.PhotographerId == _currentUser.PhotographerId.Value);

        if (request.Type.HasValue)
            query = query.Where(a => a.ActivityType == request.Type.Value);

        if (request.From.HasValue)
            query = query.Where(a => a.CreatedAt >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(a => a.CreatedAt <= request.To.Value);

        var activities = await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Type,Name,Email,Details,Resolution,Timestamp");

        foreach (var a in activities)
        {
            var escapedDetails = (a.Details ?? "").Replace("\"", "\"\"");
            sb.AppendLine($"{a.ActivityType},\"{a.ActorName}\",\"{a.ActorEmail}\",\"{escapedDetails}\",{a.Resolution?.ToString() ?? ""},\"{a.CreatedAt:O}\"");
        }

        return Result<byte[]>.Success(Encoding.UTF8.GetBytes(sb.ToString()));
    }
}
