using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Commands;

public record DeleteProductCommand(Guid ProductId) : IRequest<Result>;

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteProductHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteProductCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Failure("Forbidden", 403);

        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == cmd.ProductId && p.PhotographerId == _currentUser.PhotographerId, ct);

        if (product is null)
            return Result.NotFound("Product not found");

        product.IsDeleted = true;
        product.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
