import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG, CulturalTagDto, PhotographerProfileDto } from 'api';
import { ProfileDiscoveryPageComponent } from './profile-discovery-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('ProfileDiscoveryPageComponent', () => {
  let component: ProfileDiscoveryPageComponent;
  let fixture: ComponentFixture<ProfileDiscoveryPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockTags: CulturalTagDto[] = [
    { id: 'tag-1', label: 'Caribbean Wedding', isCustom: false, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'tag-2', label: 'Nigerian Traditional', isCustom: false, createdAt: '2025-01-01T00:00:00Z' },
  ];

  const mockProfile: PhotographerProfileDto = {
    id: 'p-1',
    displayName: 'Jane Photographer',
    neighborhood: 'Scarborough',
    serviceRadiusKm: 30,
    culturalTags: [mockTags[0]],
    rating: 4.5,
    reviewCount: 12,
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDiscoveryPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileDiscoveryPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(): void {
    fixture.detectChanges();
    const tagsReq = httpTesting.expectOne(`${baseUrl}/api/discovery/cultural-tags`);
    tagsReq.flush(mockTags);
    const profileReq = httpTesting.expectOne(`${baseUrl}/api/discovery/profile`);
    profileReq.flush(mockProfile);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load cultural tags on init', () => {
    flushInitialLoad();
    expect(component.availableTags()).toEqual(mockTags);
  });

  it('should load profile and set selected tags', () => {
    flushInitialLoad();
    expect(component.selectedTagIds()).toEqual(['tag-1']);
    expect(component.neighborhood).toBe('Scarborough');
    expect(component.serviceRadius).toBe(30);
  });

  it('should toggle tag selection', () => {
    flushInitialLoad();
    component.toggleTag('tag-2');
    expect(component.selectedTagIds()).toContain('tag-2');
    component.toggleTag('tag-2');
    expect(component.selectedTagIds()).not.toContain('tag-2');
  });

  it('should add custom tag', () => {
    flushInitialLoad();
    component.customTagInput = 'My Custom Tag';
    component.addCustomTag();
    expect(component.customTags()).toContain('My Custom Tag');
    expect(component.customTagInput).toBe('');
  });

  it('should not add duplicate custom tag', () => {
    flushInitialLoad();
    component.customTagInput = 'Tag A';
    component.addCustomTag();
    component.customTagInput = 'Tag A';
    component.addCustomTag();
    expect(component.customTags().filter((t) => t === 'Tag A').length).toBe(1);
  });

  it('should remove custom tag', () => {
    flushInitialLoad();
    component.customTagInput = 'Tag B';
    component.addCustomTag();
    component.removeCustomTag('Tag B');
    expect(component.customTags()).not.toContain('Tag B');
  });

  it('should save profile', () => {
    flushInitialLoad();
    component.onSave();
    const req = httpTesting.expectOne(`${baseUrl}/api/discovery/profile`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockProfile);
  });
});
