using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.CRM.Quotes;

public record CreateQuoteCommand(
    string Title,
    Guid? ContactId,
    Guid? ProjectId,
    string? Notes,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<CreateQuoteItemInput> Items) : IRequest<Result<QuoteDto>>;

public record CreateQuoteItemInput(string Name, string? Description, int Quantity, long UnitPriceCents, int SortOrder);

public class CreateQuoteValidator : AbstractValidator<CreateQuoteCommand>
{
    public CreateQuoteValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Items).NotEmpty();
    }
}

public class CreateQuoteHandler : IRequestHandler<CreateQuoteCommand, Result<QuoteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateQuoteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuoteDto>> Handle(CreateQuoteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var quote = new Quote
        {
            PhotographerId = photographerId,
            Title = request.Title,
            ContactId = request.ContactId,
            ProjectId = request.ProjectId,
            Notes = request.Notes,
            IsTemplate = request.IsTemplate,
            TemplateName = request.TemplateName
        };

        long total = 0;
        foreach (var item in request.Items)
        {
            var lineTotal = item.UnitPriceCents * item.Quantity;
            total += lineTotal;
            quote.Items.Add(new QuoteItem
            {
                Name = item.Name,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPriceCents = item.UnitPriceCents,
                TotalCents = lineTotal,
                SortOrder = item.SortOrder
            });
        }
        quote.TotalCents = total;

        _db.Set<Quote>().Add(quote);
        await _db.SaveChangesAsync(ct);

        return Result<QuoteDto>.Success(MapToDto(quote));
    }

    internal static QuoteDto MapToDto(Quote q) =>
        new(q.Id, q.Title, q.ContactId,
            q.Contact != null ? $"{q.Contact.FirstName} {q.Contact.LastName}" : null,
            q.Status, q.TotalCents, q.SentAt, q.AcceptedAt, q.GeneratedInvoiceId,
            q.IsTemplate, q.TemplateName,
            q.Items.OrderBy(i => i.SortOrder).Select(i =>
                new QuoteItemDto(i.Id, i.Name, i.Description, i.Quantity, i.UnitPriceCents, i.TotalCents, i.SortOrder)).ToList(),
            q.CreatedAt);
}
