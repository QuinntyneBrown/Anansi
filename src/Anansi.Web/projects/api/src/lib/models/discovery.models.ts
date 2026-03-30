import {
  EventCategory,
  EventRecurrence,
  EventStatus,
  PresetContext,
  PresetVisibility,
  SkinToneRange,
} from './enums';

// --- Cultural Discovery (L27) ---

export interface CulturalTagDto {
  id: string;
  label: string;
  isCustom: boolean;
  createdAt: string;
}

export interface PhotographerProfileDto {
  id: string;
  displayName: string;
  neighborhood: string;
  serviceRadiusKm: number;
  culturalTags: CulturalTagDto[];
  coverImageUrl?: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  bio?: string;
  createdAt: string;
}

export interface UpdateProfileDiscoveryCommand {
  culturalTagIds: string[];
  customTags: string[];
  neighborhood: string;
  serviceRadiusKm: number;
}

export interface DirectorySearchParams {
  search?: string;
  culturalTagId?: string;
  neighborhood?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// --- Skin Tone Presets (L28) ---

export interface PresetDto {
  id: string;
  name: string;
  description?: string;
  authorName: string;
  authorId: string;
  skinTone: SkinToneRange;
  context: PresetContext;
  visibility: PresetVisibility;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  isFavorited: boolean;
  favoriteCount: number;
  downloadCount: number;
  adjustments: PresetAdjustmentDto;
  createdAt: string;
}

export interface PresetAdjustmentDto {
  hue: number;
  saturation: number;
  luminance: number;
  highlights: number;
  shadows: number;
  contrast: number;
  temperature: number;
  tint: number;
  vibrance: number;
  clarity: number;
}

export interface CreatePresetCommand {
  name: string;
  description?: string;
  skinTone: SkinToneRange;
  context: PresetContext;
  visibility: PresetVisibility;
  adjustments: PresetAdjustmentDto;
}

export interface PresetListParams {
  skinTone?: SkinToneRange;
  context?: PresetContext;
  search?: string;
  favoritesOnly?: boolean;
  myPresetsOnly?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Events Calendar (L29) ---

export interface CommunityEventDto {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  neighborhood: string;
  category: EventCategory;
  recurrence: EventRecurrence;
  status: EventStatus;
  organizerName: string;
  organizerId: string;
  createdAt: string;
}

export interface CreateCommunityEventCommand {
  name: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  neighborhood: string;
  category: EventCategory;
  recurrence: EventRecurrence;
}

export interface EventListParams {
  month?: number;
  year?: number;
  category?: EventCategory;
  neighborhood?: string;
  page?: number;
  pageSize?: number;
}
