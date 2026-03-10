import {
  AnimationType,
  BlogLayoutType,
  BlogPostStatus,
  Breakpoint,
  ElementType,
  RedirectType,
  TemplateCategory,
  WebsitePageType,
  WebsiteStatus,
} from './enums';

// --- Websites ---

export interface WebsiteDto {
  id: string;
  photographerId: string;
  name: string;
  description?: string;
  status: WebsiteStatus;
  templateId?: string;
  primaryFontFamily?: string;
  secondaryFontFamily?: string;
  customFontUrl?: string;
  colorPaletteJson?: string;
  animationType: AnimationType;
  animationsEnabled: boolean;
  subdomain: string;
  sslEnabled: boolean;
  customDomain?: string;
  customDomainVerified: boolean;
  rightClickProtectionEnabled: boolean;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImageUrl?: string;
  builtInAnalyticsEnabled: boolean;
  googleAnalyticsMeasurementId?: string;
  facebookPixelId?: string;
  blogLayout: BlogLayoutType;
  blogPostsPerPage: number;
  blogLoadMoreEnabled: boolean;
  hasSitePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsiteCommand {
  name: string;
  description?: string;
  templateId?: string;
  subdomain: string;
}

export interface UpdateWebsiteCommand {
  id: string;
  name: string;
  description?: string;
  primaryFontFamily?: string;
  secondaryFontFamily?: string;
  customFontUrl?: string;
  colorPaletteJson?: string;
  animationType: AnimationType;
  animationsEnabled: boolean;
  rightClickProtectionEnabled: boolean;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImageUrl?: string;
  builtInAnalyticsEnabled: boolean;
  blogLayout: BlogLayoutType;
  blogPostsPerPage: number;
  blogLoadMoreEnabled: boolean;
}

export interface ConfigureWebsiteCustomDomainCommand {
  websiteId: string;
  customDomain: string;
}

export interface WebsiteAnalyticsDto {
  websiteId: string;
  startDate: string;
  endDate: string;
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDurationSeconds: number;
  dailySnapshots: DailyAnalyticsDto[];
}

export interface DailyAnalyticsDto {
  date: string;
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDurationSeconds: number;
  geographicDistributionJson?: string;
  topPagesJson?: string;
}

export interface WebsiteListParams {
  status?: WebsiteStatus;
}

export interface WebsiteAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

// --- Website Pages ---

export interface WebsitePageDto {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  pageType: WebsitePageType;
  sortOrder: number;
  isVisible: boolean;
  showInNavigation: boolean;
  hasPassword: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageCommand {
  websiteId: string;
  title: string;
  slug: string;
  pageType: WebsitePageType;
  showInNavigation?: boolean;
  pagePassword?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export interface UpdatePageCommand {
  pageId: string;
  title: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  showInNavigation: boolean;
  pagePassword?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

// --- Page Elements ---

export interface PageElementDto {
  id: string;
  pageId: string;
  elementType: ElementType;
  contentJson?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  sortOrder: number;
  parentElementId?: string;
  breakpointOverrides: BreakpointOverrideDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BreakpointOverrideDto {
  id: string;
  breakpoint: Breakpoint;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  isHidden: boolean;
  styleOverridesJson?: string;
}

export interface CreateElementCommand {
  pageId: string;
  elementType: ElementType;
  contentJson?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  sortOrder: number;
  parentElementId?: string;
}

export interface UpdateElementCommand {
  elementId: string;
  contentJson?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  sortOrder: number;
}

// --- Blog ---

export interface BlogPostDto {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml: string;
  featuredImageUrl?: string;
  status: BlogPostStatus;
  publishDate?: string;
  scheduledPublishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  importedFromUrl?: string;
  categories: BlogCategoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface CreateBlogPostCommand {
  websiteId: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml: string;
  featuredImageUrl?: string;
  status: BlogPostStatus;
  publishDate?: string;
  scheduledPublishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  categoryIds?: string[];
}

export interface UpdateBlogPostCommand {
  postId: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml: string;
  featuredImageUrl?: string;
  status: BlogPostStatus;
  publishDate?: string;
  scheduledPublishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  categoryIds?: string[];
}

export interface ImportBlogPostCommand {
  websiteId: string;
  url: string;
}

export interface CreateBlogCategoryCommand {
  websiteId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface BlogPostListParams {
  status?: BlogPostStatus;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

// --- Website Templates ---

export interface WebsiteTemplateDto {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  previewImageUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface LandingPageTemplateDto {
  id: string;
  name: string;
  description?: string;
  useCase: string;
  previewImageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Website Typography ---

export interface WebsiteFontDto {
  id: string;
  fontFamily: string;
  fileUrl: string;
  fileFormat: string;
  fontWeight?: string;
  fontStyle?: string;
}

export interface UploadCustomFontCommand {
  fontFamily: string;
  fileUrl: string;
  fileFormat: string;
  fontWeight?: string;
  fontStyle?: string;
}

export interface ColorPaletteDto {
  id: string;
  name: string;
  colorsJson: string;
  isSystem: boolean;
  sortOrder: number;
}

export interface CreateCustomColorPaletteCommand {
  name: string;
  colorsJson: string;
}

// --- Website SEO ---

export interface SeoAuditResultDto {
  websiteId: string;
  issues: SeoIssueDto[];
}

export interface SeoIssueDto {
  pageTitle: string;
  slug: string;
  pageId?: string;
  issueType: string;
  description: string;
}

export interface GenerateAiAltTextCommand {
  websiteId: string;
  imageUrl: string;
}

export interface UrlRedirectDto {
  id: string;
  websiteId: string;
  sourcePath: string;
  destinationUrl: string;
  redirectType: RedirectType;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUrlRedirectCommand {
  websiteId: string;
  sourcePath: string;
  destinationUrl: string;
  redirectType: RedirectType;
}

export interface UpdateUrlRedirectCommand {
  redirectId: string;
  sourcePath: string;
  destinationUrl: string;
  redirectType: RedirectType;
  isActive: boolean;
}
