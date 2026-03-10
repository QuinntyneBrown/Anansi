using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record ContactDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Address,
    string? City,
    string? Province,
    string? PostalCode,
    string? Country,
    string? Notes,
    ContactType ContactType,
    DateTime CreatedAt,
    DateTime UpdatedAt);
