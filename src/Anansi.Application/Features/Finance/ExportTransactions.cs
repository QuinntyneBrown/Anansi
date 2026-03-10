using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Finance;

/// <summary>
/// Export transactions as CSV (RPT-4.10.3).
/// </summary>
public record ExportTransactionsQuery(DateTime? From, DateTime? To) : IRequest<Result<string>>;

public class ExportTransactionsHandler : IRequestHandler<ExportTransactionsQuery, Result<string>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ExportTransactionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<string>> Handle(ExportTransactionsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<PaymentRecord>()
            .Where(p => p.PhotographerId == photographerId);

        if (request.From.HasValue) query = query.Where(p => p.CreatedAt >= request.From.Value);
        if (request.To.HasValue) query = query.Where(p => p.CreatedAt <= request.To.Value);

        var records = await query.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);

        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Date,Description,Amount,Fee,Net,Tip,Tax,Method,CardLast4,ExternalId,IsRefund");
        foreach (var r in records)
        {
            csv.AppendLine($"{r.CreatedAt:yyyy-MM-dd},{Escape(r.Description)},{r.AmountCents / 100m:F2},{r.FeeCents / 100m:F2},{r.NetAmountCents / 100m:F2},{r.TipCents / 100m:F2},{r.TaxCents / 100m:F2},{r.PaymentMethod},{r.CardLast4},{r.ExternalPaymentId},{r.IsRefund}");
        }

        return Result<string>.Success(csv.ToString());
    }

    private static string Escape(string? value) =>
        value is null ? "" : $"\"{value.Replace("\"", "\"\"")}\"";
}
