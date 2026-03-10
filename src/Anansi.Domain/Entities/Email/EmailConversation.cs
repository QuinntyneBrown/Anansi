using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Email;

/// <summary>
/// Threaded email conversation with a client (EML-5.1.1).
/// </summary>
public class EmailConversation : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }
    public string? ClientName { get; set; }
    public bool IsRead { get; set; }
    public DateTime? LastMessageAt { get; set; }

    // Navigation
    public ICollection<EmailMessage> Messages { get; set; } = new List<EmailMessage>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
