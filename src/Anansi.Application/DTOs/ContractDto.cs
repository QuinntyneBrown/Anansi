using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record ContractDto(
    Guid Id,
    Guid? ContactId,
    string? ContactName,
    string Title,
    string Content,
    string? HeaderImageUrl,
    ContractStatus Status,
    int? ExpiryDays,
    DateTime? SentAt,
    DateTime? ExpiresAt,
    bool AutoRemindersEnabled,
    int? ReminderIntervalDays,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<ContractFieldDto> Fields,
    IReadOnlyList<ContractSignatureDto> Signatures,
    DateTime CreatedAt);

public record ContractFieldDto(
    Guid Id,
    string Label,
    string? DefaultValue,
    string? Value,
    bool IsVariable,
    string? VariableKey,
    int SortOrder);

public record ContractSignatureDto(
    Guid Id,
    string SignerName,
    string SignerEmail,
    string SignerRole,
    string? SignatureData,
    DateTime? SignedAt);
