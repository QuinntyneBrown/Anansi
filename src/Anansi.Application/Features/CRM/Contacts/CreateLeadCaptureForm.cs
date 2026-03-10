using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.CRM.Contacts;

public record CreateLeadCaptureFormCommand(
    string Name,
    string? Description,
    ContactType DefaultContactType,
    IReadOnlyList<CreateFormFieldInput> Fields) : IRequest<Result<LeadCaptureFormDto>>;

public record CreateFormFieldInput(string Label, QuestionType FieldType, bool IsRequired, int SortOrder, string? Options);

public class CreateLeadCaptureFormValidator : AbstractValidator<CreateLeadCaptureFormCommand>
{
    public CreateLeadCaptureFormValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
    }
}

public class CreateLeadCaptureFormHandler : IRequestHandler<CreateLeadCaptureFormCommand, Result<LeadCaptureFormDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateLeadCaptureFormHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<LeadCaptureFormDto>> Handle(CreateLeadCaptureFormCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var slug = Guid.NewGuid().ToString("N")[..12];

        var form = new LeadCaptureForm
        {
            PhotographerId = photographerId,
            Name = request.Name,
            Description = request.Description,
            DefaultContactType = request.DefaultContactType,
            Slug = slug,
            EmbedCode = $"<iframe src=\"/forms/{slug}\" width=\"100%\" height=\"600\"></iframe>"
        };

        foreach (var f in request.Fields)
        {
            form.Fields.Add(new LeadCaptureFormField
            {
                Label = f.Label,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                SortOrder = f.SortOrder,
                Options = f.Options
            });
        }

        _db.Set<LeadCaptureForm>().Add(form);
        await _db.SaveChangesAsync(ct);

        return Result<LeadCaptureFormDto>.Success(MapToDto(form));
    }

    internal static LeadCaptureFormDto MapToDto(LeadCaptureForm f) =>
        new(f.Id, f.Name, f.Description, f.DefaultContactType, f.Slug, f.EmbedCode, f.IsActive,
            f.Fields.Select(ff => new LeadCaptureFormFieldDto(ff.Id, ff.Label, ff.FieldType, ff.IsRequired, ff.SortOrder, ff.Options)).ToList(),
            f.CreatedAt);
}
