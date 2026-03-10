using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sharing;

// GAL-1.7.4: QR Code Generation
public record GenerateQrCodeQuery(Guid CollectionId) : IRequest<Result<QrCodeResult>>;

public record QrCodeResult(
    string CollectionUrl,
    string QrCodeDataUrl // Base64 PNG data URL
);

public class GenerateQrCodeHandler : IRequestHandler<GenerateQrCodeQuery, Result<QrCodeResult>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GenerateQrCodeHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QrCodeResult>> Handle(GenerateQrCodeQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<QrCodeResult>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<QrCodeResult>.NotFound("Collection not found");

        var url = $"/gallery/{collection.Slug}";
        // QR code generation would use a library in production; returning placeholder
        var qrDataUrl = $"data:image/png;base64,QR_PLACEHOLDER_{collection.Id}";

        return Result<QrCodeResult>.Success(new QrCodeResult(url, qrDataUrl));
    }
}
