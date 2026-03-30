using System.Text.RegularExpressions;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;

namespace Anansi.Infrastructure.Services;

public partial class EmailTemplateRenderer : IEmailTemplateRenderer
{
    public RenderedEmail Render(string templateKey, GalleryLanguage language, Dictionary<string, string> variables)
    {
        var template = GetTemplate(templateKey, language);
        var subject = Interpolate(template.Subject, variables);
        var body = Interpolate(template.Body, variables);
        return new RenderedEmail(subject, body);
    }

    private static string Interpolate(string template, Dictionary<string, string> variables)
    {
        return PlaceholderRegex().Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            return variables.TryGetValue(key, out var value) ? value : match.Value;
        });
    }

    [GeneratedRegex(@"\{\{(\w+)\}\}")]
    private static partial Regex PlaceholderRegex();

    private static (string Subject, string Body) GetTemplate(string templateKey, GalleryLanguage language)
    {
        return (templateKey, language) switch
        {
            // ── Gallery Share ──
            ("gallery-share", GalleryLanguage.English) => (
                "{{photographerName}} shared a gallery with you",
                GalleryShareBody("{{photographerName}} has shared a gallery with you.", "View Gallery")
            ),
            ("gallery-share", GalleryLanguage.French) => (
                "{{photographerName}} a partagé une galerie avec vous",
                GalleryShareBody("{{photographerName}} a partagé une galerie avec vous.", "Voir la galerie")
            ),
            ("gallery-share", GalleryLanguage.Spanish) => (
                "{{photographerName}} compartió una galería contigo",
                GalleryShareBody("{{photographerName}} ha compartido una galería contigo.", "Ver galería")
            ),
            ("gallery-share", GalleryLanguage.German) => (
                "{{photographerName}} hat eine Galerie mit Ihnen geteilt",
                GalleryShareBody("{{photographerName}} hat eine Galerie mit Ihnen geteilt.", "Galerie ansehen")
            ),
            ("gallery-share", GalleryLanguage.Dutch) => (
                "{{photographerName}} heeft een galerij met u gedeeld",
                GalleryShareBody("{{photographerName}} heeft een galerij met u gedeeld.", "Galerij bekijken")
            ),
            ("gallery-share", GalleryLanguage.ChineseSimplified) => (
                "{{photographerName}} 与您分享了一个相册",
                GalleryShareBody("{{photographerName}} 与您分享了一个相册。", "查看相册")
            ),
            ("gallery-share", GalleryLanguage.Portuguese) => (
                "{{photographerName}} compartilhou uma galeria com você",
                GalleryShareBody("{{photographerName}} compartilhou uma galeria com você.", "Ver galeria")
            ),
            ("gallery-share", GalleryLanguage.Swedish) => (
                "{{photographerName}} har delat ett galleri med dig",
                GalleryShareBody("{{photographerName}} har delat ett galleri med dig.", "Visa galleri")
            ),

            // ── Download Ready ──
            ("download-ready", GalleryLanguage.English) => (
                "Your download is ready",
                DownloadReadyBody("Your gallery download is ready.", "Download Now", "This link expires in 7 days.")
            ),
            ("download-ready", GalleryLanguage.French) => (
                "Votre téléchargement est prêt",
                DownloadReadyBody("Votre téléchargement de galerie est prêt.", "Télécharger maintenant", "Ce lien expire dans 7 jours.")
            ),
            ("download-ready", GalleryLanguage.Spanish) => (
                "Su descarga está lista",
                DownloadReadyBody("Su descarga de galería está lista.", "Descargar ahora", "Este enlace expira en 7 días.")
            ),
            ("download-ready", GalleryLanguage.German) => (
                "Ihr Download ist bereit",
                DownloadReadyBody("Ihr Galerie-Download ist bereit.", "Jetzt herunterladen", "Dieser Link läuft in 7 Tagen ab.")
            ),
            ("download-ready", GalleryLanguage.Dutch) => (
                "Uw download is gereed",
                DownloadReadyBody("Uw galerij-download is gereed.", "Nu downloaden", "Deze link verloopt over 7 dagen.")
            ),
            ("download-ready", GalleryLanguage.ChineseSimplified) => (
                "您的下载已就绪",
                DownloadReadyBody("您的相册下载已就绪。", "立即下载", "此链接将在7天后过期。")
            ),
            ("download-ready", GalleryLanguage.Portuguese) => (
                "Seu download está pronto",
                DownloadReadyBody("Seu download da galeria está pronto.", "Baixar agora", "Este link expira em 7 dias.")
            ),
            ("download-ready", GalleryLanguage.Swedish) => (
                "Din nedladdning är klar",
                DownloadReadyBody("Din gallerinedladdning är klar.", "Ladda ner nu", "Denna länk upphör om 7 dagar.")
            ),

            // ── Booking Confirmation ──
            ("booking-confirmation", GalleryLanguage.English) => (
                "Booking Confirmed: {{sessionType}}",
                BookingBody("Your booking has been confirmed.", "Session", "Date", "Time", "Location")
            ),
            ("booking-confirmation", GalleryLanguage.French) => (
                "Réservation confirmée : {{sessionType}}",
                BookingBody("Votre réservation a été confirmée.", "Séance", "Date", "Heure", "Lieu")
            ),
            ("booking-confirmation", GalleryLanguage.Spanish) => (
                "Reserva confirmada: {{sessionType}}",
                BookingBody("Su reserva ha sido confirmada.", "Sesión", "Fecha", "Hora", "Ubicación")
            ),
            ("booking-confirmation", GalleryLanguage.German) => (
                "Buchung bestätigt: {{sessionType}}",
                BookingBody("Ihre Buchung wurde bestätigt.", "Sitzung", "Datum", "Uhrzeit", "Ort")
            ),
            ("booking-confirmation", GalleryLanguage.Dutch) => (
                "Boeking bevestigd: {{sessionType}}",
                BookingBody("Uw boeking is bevestigd.", "Sessie", "Datum", "Tijd", "Locatie")
            ),
            ("booking-confirmation", GalleryLanguage.ChineseSimplified) => (
                "预约已确认：{{sessionType}}",
                BookingBody("您的预约已确认。", "拍摄类型", "日期", "时间", "地点")
            ),
            ("booking-confirmation", GalleryLanguage.Portuguese) => (
                "Reserva confirmada: {{sessionType}}",
                BookingBody("Sua reserva foi confirmada.", "Sessão", "Data", "Hora", "Local")
            ),
            ("booking-confirmation", GalleryLanguage.Swedish) => (
                "Bokning bekräftad: {{sessionType}}",
                BookingBody("Din bokning har bekräftats.", "Session", "Datum", "Tid", "Plats")
            ),

            // ── Invoice ──
            ("invoice", GalleryLanguage.English) => (
                "Invoice #{{invoiceNumber}} from {{businessName}}",
                InvoiceBody("You have received a new invoice.", "View Invoice", "Amount Due", "Due Date")
            ),
            ("invoice", GalleryLanguage.French) => (
                "Facture n° {{invoiceNumber}} de {{businessName}}",
                InvoiceBody("Vous avez reçu une nouvelle facture.", "Voir la facture", "Montant dû", "Date d'échéance")
            ),
            ("invoice", GalleryLanguage.Spanish) => (
                "Factura #{{invoiceNumber}} de {{businessName}}",
                InvoiceBody("Ha recibido una nueva factura.", "Ver factura", "Monto adeudado", "Fecha de vencimiento")
            ),
            ("invoice", GalleryLanguage.German) => (
                "Rechnung Nr. {{invoiceNumber}} von {{businessName}}",
                InvoiceBody("Sie haben eine neue Rechnung erhalten.", "Rechnung ansehen", "Fälliger Betrag", "Fälligkeitsdatum")
            ),
            ("invoice", GalleryLanguage.Dutch) => (
                "Factuur #{{invoiceNumber}} van {{businessName}}",
                InvoiceBody("U heeft een nieuwe factuur ontvangen.", "Factuur bekijken", "Verschuldigd bedrag", "Vervaldatum")
            ),
            ("invoice", GalleryLanguage.ChineseSimplified) => (
                "来自 {{businessName}} 的发票 #{{invoiceNumber}}",
                InvoiceBody("您收到了一张新发票。", "查看发票", "应付金额", "到期日")
            ),
            ("invoice", GalleryLanguage.Portuguese) => (
                "Fatura #{{invoiceNumber}} de {{businessName}}",
                InvoiceBody("Você recebeu uma nova fatura.", "Ver fatura", "Valor devido", "Data de vencimento")
            ),
            ("invoice", GalleryLanguage.Swedish) => (
                "Faktura #{{invoiceNumber}} från {{businessName}}",
                InvoiceBody("Du har fått en ny faktura.", "Visa faktura", "Belopp att betala", "Förfallodatum")
            ),

            // ── Fallback to English ──
            _ => GetTemplate(templateKey, GalleryLanguage.English),
        };
    }

    private static string GalleryShareBody(string message, string buttonText) =>
        $"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#1A1A1C;color:#F5F5F0;">
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A962;margin:0 0 24px;">{{{{collectionTitle}}}}</h1>
          <p style="font-size:16px;line-height:1.6;color:#F5F5F0;">{message}</p>
          <div style="margin:32px 0;text-align:center;">
            <a href="{{{{galleryUrl}}}}" style="display:inline-block;padding:14px 32px;background:#C9A962;color:#1A1A1C;text-decoration:none;border-radius:12px;font-weight:600;">{buttonText}</a>
          </div>
        </div>
        """;

    private static string DownloadReadyBody(string message, string buttonText, string expiryNote) =>
        $"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#1A1A1C;color:#F5F5F0;">
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A962;margin:0 0 24px;">{{{{collectionTitle}}}}</h1>
          <p style="font-size:16px;line-height:1.6;color:#F5F5F0;">{message}</p>
          <div style="margin:32px 0;text-align:center;">
            <a href="{{{{downloadUrl}}}}" style="display:inline-block;padding:14px 32px;background:#C9A962;color:#1A1A1C;text-decoration:none;border-radius:12px;font-weight:600;">{buttonText}</a>
          </div>
          <p style="font-size:13px;color:#6E6E70;text-align:center;">{expiryNote}</p>
        </div>
        """;

    private static string BookingBody(string message, string sessionLabel, string dateLabel, string timeLabel, string locationLabel) =>
        $"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#1A1A1C;color:#F5F5F0;">
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A962;margin:0 0 24px;">{{{{sessionType}}}}</h1>
          <p style="font-size:16px;line-height:1.6;color:#F5F5F0;">{message}</p>
          <div style="background:#242426;border:1px solid #3A3A3C;border-radius:12px;padding:24px;margin:24px 0;">
            <p><strong style="color:#6E6E70;">{sessionLabel}:</strong> {{{{sessionType}}}}</p>
            <p><strong style="color:#6E6E70;">{dateLabel}:</strong> {{{{date}}}}</p>
            <p><strong style="color:#6E6E70;">{timeLabel}:</strong> {{{{time}}}}</p>
            <p><strong style="color:#6E6E70;">{locationLabel}:</strong> {{{{location}}}}</p>
          </div>
        </div>
        """;

    private static string InvoiceBody(string message, string buttonText, string amountLabel, string dueLabel) =>
        $"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#1A1A1C;color:#F5F5F0;">
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A962;margin:0 0 24px;">{{{{businessName}}}}</h1>
          <p style="font-size:16px;line-height:1.6;color:#F5F5F0;">{message}</p>
          <div style="background:#242426;border:1px solid #3A3A3C;border-radius:12px;padding:24px;margin:24px 0;">
            <p><strong style="color:#6E6E70;">{amountLabel}:</strong> {{{{amount}}}}</p>
            <p><strong style="color:#6E6E70;">{dueLabel}:</strong> {{{{dueDate}}}}</p>
          </div>
          <div style="margin:32px 0;text-align:center;">
            <a href="{{{{invoiceUrl}}}}" style="display:inline-block;padding:14px 32px;background:#C9A962;color:#1A1A1C;text-decoration:none;border-radius:12px;font-weight:600;">{buttonText}</a>
          </div>
        </div>
        """;
}
