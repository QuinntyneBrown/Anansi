namespace Anansi.Application.DTOs.Website;

public record SeoAuditResultDto(
    Guid WebsiteId,
    List<SeoIssueDto> Issues);

public record SeoIssueDto(
    string PageTitle,
    string Slug,
    Guid? PageId,
    string IssueType,
    string Description);
