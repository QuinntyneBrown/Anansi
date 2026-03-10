using Anansi.Domain.Common;

namespace Anansi.Domain.Entities;

public class Photographer : BaseEntity, IAuditableEntity, ISoftDeletable
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? ProfileIconUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? BrandColorHex { get; set; }
    public string? FontTheme { get; set; }
    public string? StripeAccountId { get; set; }
    public string? PayPalEmail { get; set; }
    public string? GoogleCalendarId { get; set; }
    public string? ZoomAccountId { get; set; }
    public string? GoogleAnalyticsId { get; set; }
    public string? FacebookPixelId { get; set; }
    public string? InstagramAccessToken { get; set; }
    public string? CustomGalleryDomain { get; set; }
    public string? CustomWebsiteDomain { get; set; }
    public string Subdomain { get; set; } = string.Empty;
    public Guid? ActivePlanId { get; set; }
    public long StorageUsedBytes { get; set; }
    public string? IdentityUserId { get; set; }

    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
