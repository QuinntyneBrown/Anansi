using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.1, GAL-1.6.2: Verify password
public record VerifyCollectionPasswordQuery(
    Guid CollectionId,
    string Password
) : IRequest<Result<PasswordVerificationResult>>;

public record PasswordVerificationResult(
    bool IsValid,
    bool IsClientExclusive
);

public class VerifyCollectionPasswordHandler : IRequestHandler<VerifyCollectionPasswordQuery, Result<PasswordVerificationResult>>
{
    private readonly IApplicationDbContext _db;

    public VerifyCollectionPasswordHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<PasswordVerificationResult>> Handle(VerifyCollectionPasswordQuery request, CancellationToken ct)
    {
        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId, ct);

        if (collection is null)
            return Result<PasswordVerificationResult>.NotFound("Collection not found");

        // Check client-exclusive password first
        if (!string.IsNullOrEmpty(collection.ClientExclusivePassword) && request.Password == collection.ClientExclusivePassword)
            return Result<PasswordVerificationResult>.Success(new PasswordVerificationResult(true, true));

        // Check general password
        if (!string.IsNullOrEmpty(collection.Password) && request.Password == collection.Password)
            return Result<PasswordVerificationResult>.Success(new PasswordVerificationResult(true, false));

        return Result<PasswordVerificationResult>.Success(new PasswordVerificationResult(false, false));
    }
}
