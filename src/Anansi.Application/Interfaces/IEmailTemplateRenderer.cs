using Anansi.Domain.Enums;

namespace Anansi.Application.Interfaces;

public interface IEmailTemplateRenderer
{
    /// <summary>
    /// Renders an email template with variable interpolation and language-aware subject/body.
    /// </summary>
    /// <param name="templateKey">Template identifier (e.g., "gallery-share", "download-ready", "booking-confirmation", "invoice")</param>
    /// <param name="language">Target language for the template</param>
    /// <param name="variables">Key-value pairs for placeholder replacement</param>
    /// <returns>Rendered subject and HTML body</returns>
    RenderedEmail Render(string templateKey, GalleryLanguage language, Dictionary<string, string> variables);
}

public record RenderedEmail(string Subject, string HtmlBody);
