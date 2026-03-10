using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

public record UpdateContactCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Address,
    string? City,
    string? Province,
    string? PostalCode,
    string? Country,
    string? Notes,
    ContactType ContactType) : IRequest<Result<ContactDto>>;

public class UpdateContactValidator : AbstractValidator<UpdateContactCommand>
{
    public UpdateContactValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(500);
    }
}

public class UpdateContactHandler : IRequestHandler<UpdateContactCommand, Result<ContactDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateContactHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ContactDto>> Handle(UpdateContactCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var contact = await _db.Set<Contact>()
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == photographerId, ct);

        if (contact is null) return Result<ContactDto>.NotFound("Contact not found");

        contact.FirstName = request.FirstName;
        contact.LastName = request.LastName;
        contact.Email = request.Email;
        contact.Phone = request.Phone;
        contact.Address = request.Address;
        contact.City = request.City;
        contact.Province = request.Province;
        contact.PostalCode = request.PostalCode;
        contact.Country = request.Country;
        contact.Notes = request.Notes;
        contact.ContactType = request.ContactType;

        await _db.SaveChangesAsync(ct);
        return Result<ContactDto>.Success(CreateContactHandler.MapToDto(contact));
    }
}
