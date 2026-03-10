using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

/// <summary>
/// Import contacts from CSV data (CRM-4.1.4).
/// </summary>
public record ImportContactsCommand(
    IReadOnlyList<ImportContactRow> Rows,
    bool SkipDuplicates) : IRequest<Result<ImportContactsResult>>;

public record ImportContactRow(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Address,
    string? Notes,
    ContactType ContactType);

public record ImportContactsResult(int Imported, int Skipped, int Merged);

public class ImportContactsHandler : IRequestHandler<ImportContactsCommand, Result<ImportContactsResult>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ImportContactsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ImportContactsResult>> Handle(ImportContactsCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var existingEmails = await _db.Set<Contact>()
            .Where(c => c.PhotographerId == photographerId)
            .Select(c => c.Email.ToLower())
            .ToListAsync(ct);

        var existingSet = new HashSet<string>(existingEmails, StringComparer.OrdinalIgnoreCase);
        int imported = 0, skipped = 0;

        foreach (var row in request.Rows)
        {
            if (existingSet.Contains(row.Email.ToLower()))
            {
                skipped++;
                continue;
            }

            _db.Set<Contact>().Add(new Contact
            {
                PhotographerId = photographerId,
                FirstName = row.FirstName,
                LastName = row.LastName,
                Email = row.Email,
                Phone = row.Phone,
                Address = row.Address,
                Notes = row.Notes,
                ContactType = row.ContactType
            });
            existingSet.Add(row.Email.ToLower());
            imported++;
        }

        await _db.SaveChangesAsync(ct);
        return Result<ImportContactsResult>.Success(new(imported, skipped, 0));
    }
}
