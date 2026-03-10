using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record RevenueDashboardDto(
    long TotalRevenueCents,
    long NetRevenueCents,
    long TotalFeesCents,
    long TotalRefundsCents,
    long TotalTipsCents,
    long TotalTaxCents,
    IReadOnlyList<PaymentMethodBreakdownDto> PaymentMethodBreakdown,
    int PaidInvoiceCount,
    int PendingInvoiceCount,
    int OverdueInvoiceCount);

public record PaymentMethodBreakdownDto(
    PaymentMethod PaymentMethod,
    long TotalCents,
    int Count);
