using Anansi.Application.Common;
using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Storage.Queries;

public record GetStorageUsageQuery : IRequest<Result<StorageUsageDto>>;

public record StorageUsageDto(
    long UsedBytes,
    long LimitBytes,
    double UsagePercentage,
    StorageWarningLevel WarningLevel,
    IReadOnlyList<CollectionStorageDto> CollectionBreakdown);

public record CollectionStorageDto(
    Guid CollectionId,
    string CollectionName,
    long UsedBytes);
