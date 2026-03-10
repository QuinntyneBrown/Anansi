using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.CRM.Invoices;

public record CreateInvoiceCommand(
    string Title,
    Guid? ContactId,
    Guid? ProjectId,
    DateTime? DueDate,
    decimal TaxRatePercent,
    long DiscountCents,
    bool TipsEnabled,
    long? DepositAmountCents,
    bool AutoRemindersEnabled,
    int? ReminderIntervalDays,
    bool IsTemplate,
    string? TemplateName,
    string? HeaderImageUrl,
    string? BrandColorHex,
    string? CustomHeaderFields,
    IReadOnlyList<CreateInvoiceLineItemInput> LineItems,
    IReadOnlyList<CreatePaymentScheduleInput>? PaymentSchedules) : IRequest<Result<InvoiceDto>>;

public record CreateInvoiceLineItemInput(string Name, string? Description, int Quantity, long UnitPriceCents, int SortOrder);
public record CreatePaymentScheduleInput(string Label, long AmountCents, DateTime DueDate, int SortOrder);

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.LineItems).NotEmpty();
    }
}

public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateInvoiceHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        var invoice = new Invoice
        {
            PhotographerId = photographerId,
            InvoiceNumber = invoiceNumber,
            Title = request.Title,
            ContactId = request.ContactId,
            ProjectId = request.ProjectId,
            DueDate = request.DueDate,
            TaxRatePercent = request.TaxRatePercent,
            DiscountCents = request.DiscountCents,
            TipsEnabled = request.TipsEnabled,
            DepositAmountCents = request.DepositAmountCents,
            AutoRemindersEnabled = request.AutoRemindersEnabled,
            ReminderIntervalDays = request.ReminderIntervalDays,
            IsTemplate = request.IsTemplate,
            TemplateName = request.TemplateName,
            HeaderImageUrl = request.HeaderImageUrl,
            BrandColorHex = request.BrandColorHex,
            CustomHeaderFields = request.CustomHeaderFields
        };

        long subtotal = 0;
        foreach (var li in request.LineItems)
        {
            var total = li.UnitPriceCents * li.Quantity;
            subtotal += total;
            invoice.LineItems.Add(new InvoiceLineItem
            {
                Name = li.Name,
                Description = li.Description,
                Quantity = li.Quantity,
                UnitPriceCents = li.UnitPriceCents,
                TotalCents = total,
                SortOrder = li.SortOrder
            });
        }

        invoice.SubtotalCents = subtotal;
        invoice.TaxAmountCents = (long)(subtotal * request.TaxRatePercent / 100m);
        invoice.TotalCents = subtotal + invoice.TaxAmountCents - request.DiscountCents;

        // Payment schedules (INV-4.5.2, INV-4.5.3)
        if (request.PaymentSchedules is not null)
        {
            foreach (var ps in request.PaymentSchedules)
            {
                invoice.PaymentSchedules.Add(new InvoicePaymentSchedule
                {
                    Label = ps.Label,
                    AmountCents = ps.AmountCents,
                    DueDate = ps.DueDate,
                    SortOrder = ps.SortOrder
                });
            }
        }
        else if (request.DepositAmountCents.HasValue && request.DepositAmountCents > 0)
        {
            // Auto-create deposit/balance split (INV-4.5.3)
            invoice.PaymentSchedules.Add(new InvoicePaymentSchedule
            {
                Label = "Deposit",
                AmountCents = request.DepositAmountCents.Value,
                DueDate = DateTime.UtcNow,
                SortOrder = 0
            });
            invoice.PaymentSchedules.Add(new InvoicePaymentSchedule
            {
                Label = "Remaining Balance",
                AmountCents = invoice.TotalCents - request.DepositAmountCents.Value,
                DueDate = request.DueDate ?? DateTime.UtcNow.AddDays(30),
                SortOrder = 1
            });
        }

        _db.Set<Invoice>().Add(invoice);
        await _db.SaveChangesAsync(ct);

        return Result<InvoiceDto>.Success(MapToDto(invoice));
    }

    internal static InvoiceDto MapToDto(Invoice i) =>
        new(i.Id, i.InvoiceNumber, i.Title, i.ContactId,
            i.Contact != null ? $"{i.Contact.FirstName} {i.Contact.LastName}" : null,
            i.Status, i.DueDate, i.SubtotalCents, i.TaxRatePercent, i.TaxAmountCents,
            i.DiscountCents, i.TotalCents, i.PaidCents, i.TipsEnabled, i.TipAmountCents,
            i.DepositAmountCents, i.AutoRemindersEnabled, i.IsTemplate, i.TemplateName,
            i.LineItems.OrderBy(l => l.SortOrder).Select(l =>
                new InvoiceLineItemDto(l.Id, l.Name, l.Description, l.Quantity, l.UnitPriceCents, l.TotalCents, l.SortOrder)).ToList(),
            i.PaymentSchedules.OrderBy(p => p.SortOrder).Select(p =>
                new InvoicePaymentScheduleDto(p.Id, p.Label, p.AmountCents, p.DueDate, p.IsPaid, p.PaidAt, p.SortOrder)).ToList(),
            i.CreatedAt);
}
