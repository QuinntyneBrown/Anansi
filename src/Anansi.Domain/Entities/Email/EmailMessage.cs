using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Email;

/// <summary>
/// Individual email message within a conversation (EML-5.1.1, EML-5.1.2).
/// </summary>
public class EmailMessage : BaseEntity
{
    public Guid ConversationId { get; set; }

    /// <summary>True if sent by the photographer, false if from client.</summary>
    public bool IsFromPhotographer { get; set; }

    public string SenderEmail { get; set; } = string.Empty;
    public string? SenderName { get; set; }
    public string Body { get; set; } = string.Empty;
    public string? HtmlBody { get; set; }
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public EmailConversation Conversation { get; set; } = null!;
    public ICollection<EmailAttachment> Attachments { get; set; } = new List<EmailAttachment>();
}
