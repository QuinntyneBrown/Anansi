using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record BookingRecordDto(
    Guid Id,
    Guid SessionTypeId,
    string SessionTypeName,
    Guid? ContactId,
    string ClientFirstName,
    string ClientLastName,
    string ClientEmail,
    string? ClientPhone,
    DateTime StartTime,
    DateTime EndTime,
    BookingStatus Status,
    string? Location,
    string? VideoCallLink,
    long AmountPaidCents,
    string? CouponCode,
    long DiscountCents,
    string? Notes,
    DateTime CreatedAt);
