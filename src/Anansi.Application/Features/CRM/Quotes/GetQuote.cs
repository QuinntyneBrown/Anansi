using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Quotes;

public record GetQuoteQuery(Guid Id) : IRequest<Result<QuoteDto>>;

public class GetQuoteHandler : IRequestHandler<GetQuoteQuery, Result<QuoteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetQuoteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuoteDto>> Handle(GetQuoteQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var quote = await _db.Set<Quote>()
            .Include(q => q.Items)
            .Include(q => q.Contact)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.PhotographerId == photographerId, ct);

        if (quote is null) return Result<QuoteDto>.NotFound("Quote not found");
        return Result<QuoteDto>.Success(CreateQuoteHandler.MapToDto(quote));
    }
}
