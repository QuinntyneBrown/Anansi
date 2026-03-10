using Anansi.Application.Interfaces;
using Anansi.Domain.Common;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Entities.Branding;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Entities.Email;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Entities.Integrations;
using Anansi.Domain.Entities.Notifications;
using Anansi.Domain.Entities.Website;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Photographer> Photographers => Set<Photographer>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<CollectionSet> CollectionSets => Set<CollectionSet>();
    public DbSet<GalleryMedia> GalleryMedia => Set<GalleryMedia>();
    public DbSet<FavoriteList> FavoriteLists => Set<FavoriteList>();
    public DbSet<FavoriteItem> FavoriteItems => Set<FavoriteItem>();
    public DbSet<GalleryActivity> GalleryActivities => Set<GalleryActivity>();
    public DbSet<GalleryEmailRegistration> GalleryEmailRegistrations => Set<GalleryEmailRegistration>();
    public DbSet<CollectionPreset> CollectionPresets => Set<CollectionPreset>();
    public DbSet<EmailInvitation> EmailInvitations => Set<EmailInvitation>();
    public DbSet<QuickShareLink> QuickShareLinks => Set<QuickShareLink>();
    public DbSet<DownloadRequest> DownloadRequests => Set<DownloadRequest>();

    // Store
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariation> ProductVariations => Set<ProductVariation>();
    public DbSet<PackageItem> PackageItems => Set<PackageItem>();
    public DbSet<PriceSheet> PriceSheets => Set<PriceSheet>();
    public DbSet<PriceSheetItem> PriceSheetItems => Set<PriceSheetItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<GiftCard> GiftCards => Set<GiftCard>();
    public DbSet<TaxRate> TaxRates => Set<TaxRate>();
    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    // Billing
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanFeatureGate> PlanFeatureGates => Set<PlanFeatureGate>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    // Website Builder
    public DbSet<WebsiteTemplate> WebsiteTemplates => Set<WebsiteTemplate>();
    public DbSet<Website> Websites => Set<Website>();
    public DbSet<WebsitePage> WebsitePages => Set<WebsitePage>();
    public DbSet<PageElement> PageElements => Set<PageElement>();
    public DbSet<ElementBreakpointOverride> ElementBreakpointOverrides => Set<ElementBreakpointOverride>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogPostCategory> BlogPostCategories => Set<BlogPostCategory>();
    public DbSet<WebsiteFont> WebsiteFonts => Set<WebsiteFont>();
    public DbSet<ColorPalette> ColorPalettes => Set<ColorPalette>();
    public DbSet<UrlRedirect> UrlRedirects => Set<UrlRedirect>();
    public DbSet<WebsiteAnalyticsSnapshot> WebsiteAnalyticsSnapshots => Set<WebsiteAnalyticsSnapshot>();
    public DbSet<LandingPageTemplate> LandingPageTemplates => Set<LandingPageTemplate>();

    // Branding
    public DbSet<Watermark> Watermarks => Set<Watermark>();
    public DbSet<CustomDomain> CustomDomains => Set<CustomDomain>();
    public DbSet<DocumentBranding> DocumentBrandings => Set<DocumentBranding>();

    // Notifications
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();

    // CRM
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<LeadCaptureForm> LeadCaptureForms => Set<LeadCaptureForm>();
    public DbSet<LeadCaptureFormField> LeadCaptureFormFields => Set<LeadCaptureFormField>();
    public DbSet<LeadCaptureFormSubmission> LeadCaptureFormSubmissions => Set<LeadCaptureFormSubmission>();
    public DbSet<Project> CrmProjects => Set<Project>();
    public DbSet<ProjectStage> ProjectStages => Set<ProjectStage>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<ContractField> ContractFields => Set<ContractField>();
    public DbSet<ContractSignature> ContractSignatures => Set<ContractSignature>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<InvoicePaymentSchedule> InvoicePaymentSchedules => Set<InvoicePaymentSchedule>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteItem> QuoteItems => Set<QuoteItem>();
    public DbSet<Questionnaire> Questionnaires => Set<Questionnaire>();
    public DbSet<QuestionnaireQuestion> QuestionnaireQuestions => Set<QuestionnaireQuestion>();
    public DbSet<QuestionnaireResponse> QuestionnaireResponses => Set<QuestionnaireResponse>();

    // Booking
    public DbSet<SessionType> SessionTypes => Set<SessionType>();
    public DbSet<MiniSessionDate> MiniSessionDates => Set<MiniSessionDate>();
    public DbSet<BookingRecord> BookingRecords => Set<BookingRecord>();
    public DbSet<BookingCoupon> BookingCoupons => Set<BookingCoupon>();

    // Email
    public DbSet<EmailConversation> EmailConversations => Set<EmailConversation>();
    public DbSet<EmailMessage> EmailMessages => Set<EmailMessage>();
    public DbSet<EmailAttachment> EmailAttachments => Set<EmailAttachment>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<AutomatedEmailConfig> AutomatedEmailConfigs => Set<AutomatedEmailConfig>();

    // Finance
    public DbSet<PaymentRecord> PaymentRecords => Set<PaymentRecord>();
    public DbSet<FinancingApplication> FinancingApplications => Set<FinancingApplication>();

    // Integrations
    public DbSet<WebhookSubscription> WebhookSubscriptions => Set<WebhookSubscription>();
    public DbSet<WebhookDelivery> WebhookDeliveries => Set<WebhookDelivery>();
    public DbSet<CustomCodeInjection> CustomCodeInjections => Set<CustomCodeInjection>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<LabOrder> LabOrders => Set<LabOrder>();
    public DbSet<LabProduct> LabProducts => Set<LabProduct>();
    public DbSet<InstagramFeedConfig> InstagramFeedConfigs => Set<InstagramFeedConfig>();
    public DbSet<GalleryAssistConfig> GalleryAssistConfigs => Set<GalleryAssistConfig>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                builder.Entity(entityType.ClrType).HasQueryFilter(
                    BuildSoftDeleteFilter(entityType.ClrType));
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    private static System.Linq.Expressions.LambdaExpression BuildSoftDeleteFilter(Type type)
    {
        var param = System.Linq.Expressions.Expression.Parameter(type, "e");
        var prop = System.Linq.Expressions.Expression.Property(param, nameof(ISoftDeletable.IsDeleted));
        var condition = System.Linq.Expressions.Expression.Equal(prop, System.Linq.Expressions.Expression.Constant(false));
        return System.Linq.Expressions.Expression.Lambda(condition, param);
    }
}

public class ApplicationUser : IdentityUser
{
    public Guid? PhotographerId { get; set; }
}
