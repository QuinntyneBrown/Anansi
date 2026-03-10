using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// A submission from a lead capture form (CRM-4.1.5).
/// </summary>
public class LeadCaptureFormSubmission : BaseEntity
{
    public Guid FormId { get; set; }
    public Guid? ContactId { get; set; }

    /// <summary>JSON serialized field values.</summary>
    public string ResponseData { get; set; } = "{}";

    public string? SubmitterEmail { get; set; }
    public string? SubmitterFirstName { get; set; }
    public string? SubmitterLastName { get; set; }
    public string? Message { get; set; }

    // Navigation
    public LeadCaptureForm Form { get; set; } = null!;
    public Contact? Contact { get; set; }
}
