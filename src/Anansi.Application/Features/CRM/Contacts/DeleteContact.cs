using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

public record DeleteContactCommand(Guid Id) : IRequest<Result>;

public class DeleteContactHandler : IRequestHandler<DeleteContactCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteContactHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteContactCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var contact = await _db.Set<Contact>()
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == photographerId, ct);

        if (contact is null) return Result.NotFound("Contact not found");

        contact.IsDeleted = true;
        contact.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
