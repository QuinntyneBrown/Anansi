using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Fixtures;

public class GalleryTestBase : IClassFixture<TestWebApplicationFactory>
{
    protected readonly TestWebApplicationFactory Factory;

    public GalleryTestBase(TestWebApplicationFactory factory)
    {
        Factory = factory;
    }

    protected IApplicationDbContext GetDb()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
    }

    protected async Task<(Guid photographerId, Collection collection)> SeedCollectionAsync(IApplicationDbContext? db = null)
    {
        db ??= GetDb();
        var photographerId = Guid.NewGuid();

        var photographer = new Photographer
        {
            Id = photographerId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "Photographer",
            BusinessName = "Test Studio",
            Subdomain = "test-studio-" + Guid.NewGuid().ToString("N")[..8]
        };
        db.Set<Photographer>().Add(photographer);

        var collection = new Collection
        {
            PhotographerId = photographerId,
            Title = "Test Collection",
            Slug = "test-collection-" + Guid.NewGuid().ToString("N")[..8],
            Status = CollectionStatus.Draft,
            DownloadPin = "1234",
            DownloadPinEnabled = true,
            DownloadsEnabled = true,
            AllowedResolutions = "Web640,Web1024,Web2048"
        };
        db.Collections.Add(collection);
        await db.SaveChangesAsync();

        return (photographerId, collection);
    }

    protected async Task<GalleryMedia> SeedMediaAsync(IApplicationDbContext db, Guid photographerId, Guid collectionId, Guid? setId = null, string fileName = "photo.jpg")
    {
        var media = new GalleryMedia
        {
            PhotographerId = photographerId,
            CollectionId = collectionId,
            SetId = setId,
            FileName = fileName,
            OriginalFileName = fileName,
            MediaType = MediaType.Jpeg,
            ContentType = "image/jpeg",
            FileSizeBytes = 1024 * 1024,
            StorageKey = $"uploads/{Guid.NewGuid()}/{fileName}",
            Width = 4000,
            Height = 3000,
            SortOrder = 0
        };

        db.GalleryMedia.Add(media);
        await db.SaveChangesAsync();
        return media;
    }

    protected async Task<CollectionSet> SeedSetAsync(IApplicationDbContext db, Guid photographerId, Guid collectionId, string title = "Test Set", int sortOrder = 0)
    {
        var set = new CollectionSet
        {
            PhotographerId = photographerId,
            CollectionId = collectionId,
            Title = title,
            SortOrder = sortOrder
        };

        db.CollectionSets.Add(set);
        await db.SaveChangesAsync();
        return set;
    }
}
