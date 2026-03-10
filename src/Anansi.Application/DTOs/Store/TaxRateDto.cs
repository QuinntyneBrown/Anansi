namespace Anansi.Application.DTOs.Store;

public record TaxRateDto(
    Guid Id,
    string Name,
    string Region,
    decimal Percentage,
    bool IsActive);

public record CreateTaxRateRequest(
    string Name,
    string Region,
    decimal Percentage);

public record UpdateTaxRateRequest(
    string Name,
    string Region,
    decimal Percentage,
    bool IsActive);
