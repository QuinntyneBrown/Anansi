using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Record a business expense with HST for ITC tracking (TAX-21.4.1).
/// </summary>
public record RecordBusinessExpenseCommand(
    long AmountCents,
    long HstPaidCents,
    ExpenseCategory Category,
    DateTime Date,
    string Description,
    string? Vendor) : IRequest<Result<BusinessExpenseDto>>;

public class RecordBusinessExpenseValidator : AbstractValidator<RecordBusinessExpenseCommand>
{
    public RecordBusinessExpenseValidator()
    {
        RuleFor(x => x.AmountCents).GreaterThan(0);
        RuleFor(x => x.HstPaidCents).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Vendor).MaximumLength(200);
        RuleFor(x => x.Category).IsInEnum();
    }
}

public class RecordBusinessExpenseHandler : IRequestHandler<RecordBusinessExpenseCommand, Result<BusinessExpenseDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordBusinessExpenseHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BusinessExpenseDto>> Handle(RecordBusinessExpenseCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var expense = new BusinessExpense
        {
            PhotographerId = photographerId,
            AmountCents = request.AmountCents,
            HstPaidCents = request.HstPaidCents,
            Category = request.Category,
            Date = request.Date,
            Description = request.Description,
            Vendor = request.Vendor
        };

        _db.BusinessExpenses.Add(expense);
        await _db.SaveChangesAsync(ct);

        return Result<BusinessExpenseDto>.Success(
            new BusinessExpenseDto(expense.Id, expense.AmountCents, expense.HstPaidCents,
                expense.Category, expense.Date, expense.Description, expense.Vendor, expense.CreatedAt));
    }
}
