using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

public record GetContactQuery(Guid Id) : IRequest<Result<ContactDto>>;

public class GetContactHandler : IRequestHandler<GetContactQuery, Result<ContactDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetContactHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ContactDto>> Handle(GetContactQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var contact = await _db.Set<Contact>()
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == photographerId, ct);

        if (contact is null) return Result<ContactDto>.NotFound("Contact not found");

        return Result<ContactDto>.Success(CreateContactHandler.MapToDto(contact));
    }
}
