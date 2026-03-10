using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Finance;

/// <summary>
/// Create a gift card (GFT-4.9.1).
/// </summary>
public record CreateGiftCardCommand(
    long AmountCents,
    DateTime? ExpiryDate,
    string? RecipientEmail,
    string? RecipientName,
    string? SenderName,
    string? Message) : IRequest<Result<GiftCardDto>>;

public class CreateGiftCardValidator : AbstractValidator<CreateGiftCardCommand>
{
    public CreateGiftCardValidator()
    {
        RuleFor(x => x.AmountCents).GreaterThan(0);
    }
}

public class CreateGiftCardHandler : IRequestHandler<CreateGiftCardCommand, Result<GiftCardDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateGiftCardHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<GiftCardDto>> Handle(CreateGiftCardCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var code = Guid.NewGuid().ToString("N")[..12].ToUpper();

        var gc = new GiftCard
        {
            PhotographerId = photographerId,
            Code = code,
            OriginalAmountCents = request.AmountCents,
            BalanceCents = request.AmountCents,
            ExpiryDate = request.ExpiryDate,
            RecipientEmail = request.RecipientEmail,
            RecipientName = request.RecipientName,
            SenderName = request.SenderName,
            Message = request.Message
        };

        _db.Set<GiftCard>().Add(gc);
        await _db.SaveChangesAsync(ct);

        return Result<GiftCardDto>.Success(new GiftCardDto(
            gc.Id, gc.Code, gc.OriginalAmountCents, gc.BalanceCents, gc.ExpiryDate,
            gc.RecipientEmail, gc.RecipientName, gc.SenderName, gc.Message, gc.IsActive, gc.CreatedAt));
    }
}

/// <summary>
/// Redeem a gift card (GFT-4.9.2).
/// </summary>
public record RedeemGiftCardCommand(string Code, long AmountCents) : IRequest<Result<GiftCardDto>>;

public class RedeemGiftCardHandler : IRequestHandler<RedeemGiftCardCommand, Result<GiftCardDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RedeemGiftCardHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<GiftCardDto>> Handle(RedeemGiftCardCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var gc = await _db.Set<GiftCard>()
            .FirstOrDefaultAsync(g => g.PhotographerId == photographerId
                && g.Code == request.Code && g.IsActive, ct);

        if (gc is null) return Result<GiftCardDto>.NotFound("Gift card not found or inactive.");
        if (gc.ExpiryDate.HasValue && gc.ExpiryDate < DateTime.UtcNow)
            return Result<GiftCardDto>.Failure("Gift card has expired.");
        if (gc.BalanceCents <= 0)
            return Result<GiftCardDto>.Failure("Gift card has no remaining balance.");

        var redeemAmount = Math.Min(request.AmountCents, gc.BalanceCents);
        gc.BalanceCents -= redeemAmount;
        if (gc.BalanceCents == 0) gc.IsActive = false;

        await _db.SaveChangesAsync(ct);

        return Result<GiftCardDto>.Success(new GiftCardDto(
            gc.Id, gc.Code, gc.OriginalAmountCents, gc.BalanceCents, gc.ExpiryDate,
            gc.RecipientEmail, gc.RecipientName, gc.SenderName, gc.Message, gc.IsActive, gc.CreatedAt));
    }
}
