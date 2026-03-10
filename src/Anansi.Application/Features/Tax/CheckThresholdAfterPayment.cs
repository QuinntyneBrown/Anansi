using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using Anansi.Application.Features.Notifications.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Checks whether a payment pushes rolling 4-quarter revenue past 75% or 90% of the
/// $30,000 HST registration threshold and creates a notification (TAX-21.3.2).
/// Published as a MediatR notification from the RecordPayment handler.
/// </summary>
public record PaymentRecordedEvent(Guid PhotographerId, long AmountCents) : INotification;

public class CheckThresholdAfterPaymentHandler : INotificationHandler<PaymentRecordedEvent>
{
    private const long ThresholdCents = 30_000_00;

    private readonly IApplicationDbContext _db;
    private readonly IMediator _mediator;

    public CheckThresholdAfterPaymentHandler(IApplicationDbContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task Handle(PaymentRecordedEvent notification, CancellationToken ct)
    {
        var photographerId = notification.PhotographerId;

        // Check if the photographer is already registered -- skip if mandatory
        var profile = await _db.TaxProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.PhotographerId == photographerId, ct);

        if (profile is not null && profile.RegistrationStatus == HstRegistrationStatus.Mandatory)
            return;

        // Calculate rolling 4-quarter revenue
        var now = DateTime.UtcNow;
        var currentQuarter = (now.Month - 1) / 3 + 1;
        var currentYear = now.Year;

        var q = currentQuarter - 3;
        var y = currentYear;
        while (q <= 0) { q += 4; y--; }
        var startMonth = (q - 1) * 3 + 1;
        var windowStart = new DateTime(y, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);

        var rollingRevenue = await _db.Set<PaymentRecord>()
            .Where(p => p.PhotographerId == photographerId
                && !p.IsRefund
                && p.CreatedAt >= windowStart)
            .SumAsync(p => p.AmountCents, ct);

        var percentage = (decimal)rollingRevenue / ThresholdCents * 100;

        // Calculate what the revenue was before this payment to detect threshold crossing
        var previousRevenue = rollingRevenue - notification.AmountCents;
        var previousPercentage = (decimal)previousRevenue / ThresholdCents * 100;

        // Only notify when crossing 75% or 90% boundaries
        if (previousPercentage < 90 && percentage >= 90)
        {
            await _mediator.Publish(new NotificationEvent(
                photographerId,
                NotificationEventType.HstThresholdCritical,
                NotificationCategory.StudioManager,
                "HST Registration Threshold - Critical",
                $"Your rolling 4-quarter revenue has reached {percentage:F1}% of the $30,000 HST registration threshold. You may be required to register for HST.",
                Link: "/tax-profile/threshold"), ct);
        }
        else if (previousPercentage < 75 && percentage >= 75)
        {
            await _mediator.Publish(new NotificationEvent(
                photographerId,
                NotificationEventType.HstThresholdWarning,
                NotificationCategory.StudioManager,
                "HST Registration Threshold - Warning",
                $"Your rolling 4-quarter revenue has reached {percentage:F1}% of the $30,000 HST registration threshold. Consider reviewing your HST registration status.",
                Link: "/tax-profile/threshold"), ct);
        }
    }
}
