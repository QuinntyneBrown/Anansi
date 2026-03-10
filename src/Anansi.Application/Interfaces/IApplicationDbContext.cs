using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Entities.Discovery;
using Anansi.Domain.Entities.Events;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Entities.Integrations;
using Anansi.Domain.Entities.Notifications;
using Anansi.Domain.Entities.Presets;
using Anansi.Domain.Entities.Store;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Photographer> Photographers { get; }
    DbSet<Collection> Collections { get; }
    DbSet<CollectionSet> CollectionSets { get; }
    DbSet<GalleryMedia> GalleryMedia { get; }
    DbSet<FavoriteList> FavoriteLists { get; }
    DbSet<FavoriteItem> FavoriteItems { get; }
    DbSet<GalleryActivity> GalleryActivities { get; }
    DbSet<GalleryEmailRegistration> GalleryEmailRegistrations { get; }
    DbSet<CollectionPreset> CollectionPresets { get; }
    DbSet<EmailInvitation> EmailInvitations { get; }
    DbSet<QuickShareLink> QuickShareLinks { get; }
    DbSet<DownloadRequest> DownloadRequests { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<NotificationPreference> NotificationPreferences { get; }
    DbSet<WebhookSubscription> WebhookSubscriptions { get; }
    DbSet<WebhookDelivery> WebhookDeliveries { get; }
    DbSet<CustomCodeInjection> CustomCodeInjections { get; }
    DbSet<ApiKey> ApiKeys { get; }
    DbSet<LabOrder> LabOrders { get; }
    DbSet<LabProduct> LabProducts { get; }
    DbSet<InstagramFeedConfig> InstagramFeedConfigs { get; }
    DbSet<GalleryAssistConfig> GalleryAssistConfigs { get; }

    // Store
    DbSet<Product> Products { get; }
    DbSet<ProductVariation> ProductVariations { get; }
    DbSet<PackageItem> PackageItems { get; }
    DbSet<PriceSheet> PriceSheets { get; }
    DbSet<PriceSheetItem> PriceSheetItems { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<GiftCard> GiftCards { get; }
    DbSet<TaxRate> TaxRates { get; }
    DbSet<ShippingMethod> ShippingMethods { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    // Billing
    DbSet<Plan> Plans { get; }
    DbSet<PlanFeatureGate> PlanFeatureGates { get; }
    DbSet<Subscription> Subscriptions { get; }

    // Interac
    DbSet<InteracPaymentRequest> InteracPaymentRequests { get; }

    // Tax
    DbSet<TaxProfile> TaxProfiles { get; }
    DbSet<BusinessExpense> BusinessExpenses { get; }

    // Presets
    DbSet<EditingPreset> EditingPresets { get; }
    DbSet<PresetFavorite> PresetFavorites { get; }

    // Events
    DbSet<CommunityEvent> CommunityEvents { get; }
    DbSet<EventCalendarBlock> EventCalendarBlocks { get; }

    // Discovery
    DbSet<CulturalTag> CulturalTags { get; }
    DbSet<PhotographerCulturalTag> PhotographerCulturalTags { get; }
    DbSet<PhotographerServiceArea> PhotographerServiceAreas { get; }

    DbSet<T> Set<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
