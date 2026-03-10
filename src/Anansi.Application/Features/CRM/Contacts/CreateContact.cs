using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

public record CreateContactCommand(
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

public class CreateContactValidator : AbstractValidator<CreateContactCommand>
{
    public CreateContactValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(500);
    }
}

public class CreateContactHandler : IRequestHandler<CreateContactCommand, Result<ContactDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateContactHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ContactDto>> Handle(CreateContactCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var contact = new Contact
        {
            PhotographerId = photographerId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            Province = request.Province,
            PostalCode = request.PostalCode,
            Country = request.Country,
            Notes = request.Notes,
            ContactType = request.ContactType
        };

        _db.Set<Contact>().Add(contact);
        await _db.SaveChangesAsync(ct);

        return Result<ContactDto>.Success(MapToDto(contact));
    }

    internal static ContactDto MapToDto(Contact c) =>
        new(c.Id, c.FirstName, c.LastName, c.Email, c.Phone, c.Address, c.City,
            c.Province, c.PostalCode, c.Country, c.Notes, c.ContactType, c.CreatedAt, c.UpdatedAt);
}
