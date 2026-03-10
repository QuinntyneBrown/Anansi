using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contracts;

public record CreateContractCommand(
    string Title,
    string Content,
    string? HeaderImageUrl,
    Guid? ContactId,
    Guid? ProjectId,
    int? ExpiryDays,
    bool AutoRemindersEnabled,
    int? ReminderIntervalDays,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<CreateContractFieldInput>? Fields) : IRequest<Result<ContractDto>>;

public record CreateContractFieldInput(string Label, string? DefaultValue, bool IsVariable, string? VariableKey, int SortOrder);

public class CreateContractValidator : AbstractValidator<CreateContractCommand>
{
    public CreateContractValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Content).NotEmpty();
    }
}

public class CreateContractHandler : IRequestHandler<CreateContractCommand, Result<ContractDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateContractHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ContractDto>> Handle(CreateContractCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var contract = new Contract
        {
            PhotographerId = photographerId,
            Title = request.Title,
            Content = request.Content,
            HeaderImageUrl = request.HeaderImageUrl,
            ContactId = request.ContactId,
            ProjectId = request.ProjectId,
            ExpiryDays = request.ExpiryDays,
            AutoRemindersEnabled = request.AutoRemindersEnabled,
            ReminderIntervalDays = request.ReminderIntervalDays,
            IsTemplate = request.IsTemplate,
            TemplateName = request.TemplateName
        };

        if (request.Fields is not null)
        {
            foreach (var f in request.Fields)
            {
                contract.Fields.Add(new ContractField
                {
                    Label = f.Label,
                    DefaultValue = f.DefaultValue,
                    IsVariable = f.IsVariable,
                    VariableKey = f.VariableKey,
                    SortOrder = f.SortOrder
                });
            }
        }

        // Auto-add photographer and client signature fields (CON-4.4.4)
        contract.Signatures.Add(new ContractSignature { SignerRole = "Photographer", SignerName = "Photographer", SignerEmail = "" });
        contract.Signatures.Add(new ContractSignature { SignerRole = "Client", SignerName = "", SignerEmail = "" });

        _db.Set<Contract>().Add(contract);
        await _db.SaveChangesAsync(ct);

        return Result<ContractDto>.Success(MapToDto(contract));
    }

    internal static ContractDto MapToDto(Contract c) =>
        new(c.Id, c.ContactId, c.Contact != null ? $"{c.Contact.FirstName} {c.Contact.LastName}" : null,
            c.Title, c.Content, c.HeaderImageUrl, c.Status, c.ExpiryDays, c.SentAt, c.ExpiresAt,
            c.AutoRemindersEnabled, c.ReminderIntervalDays, c.IsTemplate, c.TemplateName,
            c.Fields.OrderBy(f => f.SortOrder).Select(f =>
                new ContractFieldDto(f.Id, f.Label, f.DefaultValue, f.Value, f.IsVariable, f.VariableKey, f.SortOrder)).ToList(),
            c.Signatures.Select(s =>
                new ContractSignatureDto(s.Id, s.SignerName, s.SignerEmail, s.SignerRole, s.SignatureData, s.SignedAt)).ToList(),
            c.CreatedAt);
}
