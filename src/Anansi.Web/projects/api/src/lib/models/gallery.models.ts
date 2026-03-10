import {
  ActivityType,
  CollectionStatus,
  CoverStyle,
  DownloadResolution,
  GalleryLanguage,
  GridLayout,
  MediaType,
  SlideshowSpeed,
  ThemeMode,
} from './enums';

// --- Collections ---

export interface CollectionDto {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: CollectionStatus;
  coverStyle: CoverStyle;
  coverPhotoId?: string;
  coverFocalPointX?: number;
  coverFocalPointY?: number;
  coverVideoUrl?: string;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  downloadsEnabled: boolean;
  downloadPinEnabled: boolean;
  downloadPin?: string;
  downloadLimit?: number;
  downloadCount: number;
  allowedResolutions: string;
  favoriteLimit?: number;
  slideshowSpeed: SlideshowSpeed;
  slideshowAutoLoop: boolean;
  expiresAt?: string;
  language: GalleryLanguage;
  embeddingEnabled: boolean;
  googleAnalyticsPropertyId?: string;
  isStarred: boolean;
  requireEmailRegistration: boolean;
  hasPassword: boolean;
  hasClientExclusivePassword: boolean;
  createdAt: string;
  updatedAt: string;
  setCount: number;
  mediaCount: number;
}

export interface CollectionSummaryDto {
  id: string;
  title: string;
  slug: string;
  status: CollectionStatus;
  coverStyle: CoverStyle;
  isStarred: boolean;
  language: GalleryLanguage;
  createdAt: string;
  setCount: number;
  mediaCount: number;
}

export interface CreateCollectionCommand {
  title: string;
  description?: string;
  coverStyle: CoverStyle;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  language: GalleryLanguage;
  presetId?: string;
}

export interface UpdateCollectionCommand {
  id: string;
  title: string;
  description?: string;
  status: CollectionStatus;
  coverStyle: CoverStyle;
  coverPhotoId?: string;
  coverFocalPointX?: number;
  coverFocalPointY?: number;
  coverVideoUrl?: string;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  downloadsEnabled: boolean;
  downloadPinEnabled: boolean;
  downloadPin?: string;
  downloadLimit?: number;
  allowedResolutions: string;
  favoriteLimit?: number;
  slideshowSpeed: SlideshowSpeed;
  slideshowAutoLoop: boolean;
  expiresAt?: string;
  language: GalleryLanguage;
  embeddingEnabled: boolean;
  googleAnalyticsPropertyId?: string;
  requireEmailRegistration: boolean;
}

export interface BulkCreateCollectionsCommand {
  collections: BulkCollectionItem[];
  presetId?: string;
}

export interface BulkCollectionItem {
  title: string;
  clientName?: string;
  clientEmail?: string;
}

export interface CollectionListParams {
  page?: number;
  pageSize?: number;
  starredOnly?: boolean;
  status?: CollectionStatus;
  search?: string;
}

export interface SetPasswordRequest {
  password?: string;
  clientExclusivePassword?: string;
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface RegisterEmailRequest {
  name: string;
  email: string;
}

export interface GalleryEmailRegistrationDto {
  id: string;
  collectionId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SetExpiryRequest {
  expiresAt?: string;
  reminderRecipients?: string;
  reminderDays?: string;
  reminderEmailTemplate?: string;
}

export interface RequestDownloadRequest {
  resolution: DownloadResolution;
  isFullGallery: boolean;
  mediaIds?: string[];
  pin?: string;
  requestedBy?: string;
  requestedByEmail?: string;
}

export interface DownloadRequestDto {
  id: string;
  collectionId: string;
  requestedBy?: string;
  requestedByEmail?: string;
  resolution: DownloadResolution;
  isFullGallery: boolean;
  mediaIds?: string;
  isReady: boolean;
  readyAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ResetDownloadLimitRequest {
  newLimit?: number;
}

export interface SendEmailInvitationCommand {
  collectionId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  headerImageUrl?: string;
  includePassword: boolean;
}

export interface CreateQuickShareRequest {
  mediaIds: string[];
}

export interface QuickShareLinkDto {
  id: string;
  collectionId: string;
  token: string;
  mediaIds: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface GalleryActivityDto {
  id: string;
  collectionId: string;
  activityType: ActivityType;
  actorName?: string;
  actorEmail?: string;
  mediaId?: string;
  favoriteListId?: string;
  details?: string;
  resolution?: DownloadResolution;
  isFullGallery?: boolean;
  createdAt: string;
}

export interface SetGoogleAnalyticsRequest {
  googleAnalyticsPropertyId?: string;
}

export interface CollectionActivityParams {
  type?: ActivityType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// --- Collection Sets ---

export interface CollectionSetDto {
  id: string;
  collectionId: string;
  title: string;
  description?: string;
  sortOrder: number;
  isClientExclusive: boolean;
  createdAt: string;
  mediaCount: number;
}

export interface CreateSetRequest {
  title: string;
  description?: string;
  sortOrder: number;
  isClientExclusive: boolean;
}

export interface UpdateSetRequest {
  title: string;
  description?: string;
  sortOrder: number;
  isClientExclusive: boolean;
}

export interface ReorderSetsRequest {
  setIdsInOrder: string[];
}

// --- Gallery Media ---

export interface GalleryMediaDto {
  id: string;
  collectionId: string;
  setId?: string;
  fileName: string;
  originalFileName: string;
  mediaType: MediaType;
  contentType: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  dateTaken?: string;
  duration?: string;
  videoResolution?: string;
  sortOrder: number;
  isStarred: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface GalleryMediaListParams {
  setId?: string;
  starredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface MoveMediaRequest {
  targetSetId?: string;
}

export interface BulkStarRequest {
  mediaIds: string[];
  star: boolean;
}

export interface TogglePrivateRequest {
  clientName?: string;
  clientEmail?: string;
}

// --- Collection Presets ---

export interface CollectionPresetDto {
  id: string;
  name: string;
  coverStyle: CoverStyle;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  downloadsEnabled: boolean;
  downloadPinEnabled: boolean;
  allowedResolutions: string;
  requireEmailRegistration: boolean;
  language: GalleryLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresetCommand {
  name: string;
  coverStyle: CoverStyle;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  downloadsEnabled: boolean;
  downloadPinEnabled: boolean;
  allowedResolutions: string;
  requireEmailRegistration: boolean;
  language: GalleryLanguage;
}

export interface UpdatePresetCommand {
  id: string;
  name: string;
  coverStyle: CoverStyle;
  theme: ThemeMode;
  fontFamily: string;
  colorPalette: string;
  customColorHex?: string;
  layout: GridLayout;
  downloadsEnabled: boolean;
  downloadPinEnabled: boolean;
  allowedResolutions: string;
  requireEmailRegistration: boolean;
  language: GalleryLanguage;
}

// --- Favorites ---

export interface FavoriteListDto {
  id: string;
  collectionId: string;
  name: string;
  clientName?: string;
  clientEmail?: string;
  isPreset: boolean;
  isCompleted: boolean;
  shareToken?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFavoriteListCommand {
  collectionId: string;
  name: string;
  clientName?: string;
  clientEmail?: string;
  isPreset: boolean;
}

export interface FavoriteItemDto {
  id: string;
  favoriteListId: string;
  mediaId: string;
  comment?: string;
  mediaFileName?: string;
  createdAt: string;
}

export interface AddFavoriteItemRequest {
  mediaId: string;
  comment?: string;
}

export interface UpdateCommentRequest {
  comment: string;
}

export interface FavoriteListParams {
  collectionId?: string;
  page?: number;
  pageSize?: number;
}
