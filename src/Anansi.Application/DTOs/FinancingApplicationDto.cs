namespace Anansi.Application.DTOs;

public record FinancingApplicationDto(
    Guid Id,
    long RequestedAmountCents,
    long? OfferedAmountCents,
    long? FlatFeeCents,
    decimal? RepaymentPercentage,
    long RepaidCents,
    string Status,
    DateTime? ApprovedAt,
    DateTime? FundedAt,
    DateTime? RepaidAt,
    DateTime CreatedAt);
