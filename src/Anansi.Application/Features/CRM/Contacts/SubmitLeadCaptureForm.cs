using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

/// <summary>
/// Public form submission that auto-creates contact and project card (CRM-4.1.5, CRM-4.2.3).
/// </summary>
public record SubmitLeadCaptureFormCommand(
    string FormSlug,
    string FirstName,
    string LastName,
    string Email,
    string? Message,
    string ResponseData) : IRequest<Result<LeadCaptureFormSubmissionDto>>;

public class SubmitLeadCaptureFormHandler : IRequestHandler<SubmitLeadCaptureFormCommand, Result<LeadCaptureFormSubmissionDto>>
{
    private readonly IApplicationDbContext _db;

    public SubmitLeadCaptureFormHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result<LeadCaptureFormSubmissionDto>> Handle(SubmitLeadCaptureFormCommand request, CancellationToken ct)
    {
        var form = await _db.Set<LeadCaptureForm>()
            .Include(f => f.Fields)
            .FirstOrDefaultAsync(f => f.Slug == request.FormSlug && f.IsActive, ct);

        if (form is null) return Result<LeadCaptureFormSubmissionDto>.NotFound("Form not found");

        // Auto-create contact (CRM-4.1.5)
        var existingContact = await _db.Set<Contact>()
            .FirstOrDefaultAsync(c => c.PhotographerId == form.PhotographerId && c.Email.ToLower() == request.Email.ToLower(), ct);

        Contact contact;
        if (existingContact is not null)
        {
            contact = existingContact;
        }
        else
        {
            contact = new Contact
            {
                PhotographerId = form.PhotographerId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                ContactType = form.DefaultContactType
            };
            _db.Set<Contact>().Add(contact);
        }

        // Create submission
        var submission = new LeadCaptureFormSubmission
        {
            FormId = form.Id,
            ContactId = contact.Id,
            SubmitterEmail = request.Email,
            SubmitterFirstName = request.FirstName,
            SubmitterLastName = request.LastName,
            Message = request.Message,
            ResponseData = request.ResponseData
        };
        _db.Set<LeadCaptureFormSubmission>().Add(submission);

        // Auto-create project card in first stage (CRM-4.2.3)
        var firstStage = await _db.Set<ProjectStage>()
            .Where(s => s.PhotographerId == form.PhotographerId)
            .OrderBy(s => s.SortOrder)
            .FirstOrDefaultAsync(ct);

        if (firstStage is not null)
        {
            _db.Set<Project>().Add(new Project
            {
                PhotographerId = form.PhotographerId,
                ContactId = contact.Id,
                StageId = firstStage.Id,
                Name = $"{request.FirstName} {request.LastName} - Inquiry",
                ProjectType = "Inquiry"
            });
        }

        await _db.SaveChangesAsync(ct);

        return Result<LeadCaptureFormSubmissionDto>.Success(
            new LeadCaptureFormSubmissionDto(submission.Id, submission.FormId, submission.ContactId,
                submission.SubmitterEmail, submission.SubmitterFirstName, submission.SubmitterLastName,
                submission.Message, submission.ResponseData, submission.CreatedAt));
    }
}
