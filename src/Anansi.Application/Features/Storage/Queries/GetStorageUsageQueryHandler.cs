using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Storage.Queries;

public class GetStorageUsageQueryHandler : IRequestHandler<GetStorageUsageQuery, Result<StorageUsageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetStorageUsageQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<StorageUsageDto>> Handle(GetStorageUsageQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<StorageUsageDto>.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result<StorageUsageDto>.NotFound("Photographer not found.");

        var usedBytes = photographer.StorageUsedBytes;

        // Default storage limit: 3GB (free plan)
        const long defaultLimitBytes = 3L * 1024 * 1024 * 1024;
        var limitBytes = defaultLimitBytes; // Would be determined by plan in production

        var usagePercentage = limitBytes > 0 ? (double)usedBytes / limitBytes * 100 : 0;

        var warningLevel = usagePercentage switch
        {
            >= 95 => StorageWarningLevel.Critical95,
            >= 90 => StorageWarningLevel.Warning90,
            >= 80 => StorageWarningLevel.Warning80,
            _ => StorageWarningLevel.None
        };

        // Get breakdown by collection
        var collectionBreakdown = await _context.Collections
            .Where(c => c.PhotographerId == _currentUser.PhotographerId.Value)
            .Select(c => new CollectionStorageDto(
                c.Id,
                c.Title,
                c.Media.Sum(m => m.FileSizeBytes)))
            .ToListAsync(cancellationToken);

        return Result<StorageUsageDto>.Success(new StorageUsageDto(
            usedBytes,
            limitBytes,
            usagePercentage,
            warningLevel,
            collectionBreakdown));
    }
}
