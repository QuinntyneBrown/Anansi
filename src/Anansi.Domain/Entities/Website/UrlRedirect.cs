using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.5.4 - URL Redirects: 301/302 redirects.
/// </summary>
public class UrlRedirect : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid WebsiteId { get; set; }
    public Website Website { get; set; } = null!;

    public string SourcePath { get; set; } = string.Empty;
    public string DestinationUrl { get; set; } = string.Empty;
    public RedirectType RedirectType { get; set; } = RedirectType.Permanent301;
    public bool IsActive { get; set; } = true;
}
