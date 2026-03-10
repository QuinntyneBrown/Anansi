import {
  CodeInjectionLocation,
  DocumentType,
  DomainPurpose,
  EmailDigestOption,
  NotificationCategory,
  NotificationDeliveryMethod,
  PaymentMethod,
  SslStatus,
  WatermarkPosition,
  WatermarkType,
  WebhookEventType,
} from './enums';

// --- API Keys ---

export interface CreateApiKeyCommand {
  name: string;
  expiresAt?: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  apiKey: string;
  keyPrefix: string;
  expiresAt?: string;
}

// --- Notifications ---

export interface NotificationDto {
  id: string;
  photographerId: string;
  eventType: string;
  category: NotificationCategory;
  title: string;
  message: string;
  clientName?: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferencesDto {
  preferences: NotificationPreferenceItemDto[];
}

export interface NotificationPreferenceItemDto {
  eventType: string;
  deliveryMethods: NotificationDeliveryMethod[];
  emailDigest: EmailDigestOption;
}

export interface UpdateNotificationPreferenceCommand {
  eventType: string;
  deliveryMethods: NotificationDeliveryMethod[];
  emailDigest: EmailDigestOption;
}

export interface NotificationListParams {
  category?: NotificationCategory;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UnreadCountResponse {
  count: number;
}

// --- Email ---

export interface EmailConversationDto {
  id: string;
  contactId?: string;
  subject: string;
  clientEmail?: string;
  clientName?: string;
  isRead: boolean;
  lastMessageAt?: string;
  messages: EmailMessageDto[];
  createdAt: string;
}

export interface EmailMessageDto {
  id: string;
  isFromPhotographer: boolean;
  senderEmail: string;
  senderName?: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  attachments: EmailAttachmentDto[];
}

export interface EmailAttachmentDto {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageUrl: string;
}

export interface SendEmailCommand {
  contactId?: string;
  recipientEmail: string;
  subject: string;
  body: string;
  htmlBody?: string;
  templateId?: string;
}

export interface EmailTemplateDto {
  id: string;
  name: string;
  category: string;
  subjectLine?: string;
  body: string;
  htmlBody?: string;
  headerImageUrl?: string;
  useBranding: boolean;
  createdAt: string;
}

export interface CreateEmailTemplateCommand {
  name: string;
  category: string;
  subjectLine?: string;
  body: string;
  htmlBody?: string;
  headerImageUrl?: string;
  useBranding: boolean;
}

export interface AutomatedEmailConfigDto {
  id: string;
  eventType: string;
  isEnabled: boolean;
  emailTemplateId?: string;
  timingOffsetHours?: number;
  reminderFrequencyDays?: number;
  recipientTypes?: string;
  daysBeforeEvent?: string;
}

export interface UpsertAutomatedEmailConfigCommand {
  eventType: string;
  isEnabled: boolean;
  emailTemplateId?: string;
  timingOffsetHours?: number;
  reminderFrequencyDays?: number;
  recipientTypes?: string;
  daysBeforeEvent?: string;
}

export interface EmailConversationListParams {
  page?: number;
  pageSize?: number;
}

// --- Branding ---

export interface BrandingProfileDto {
  photographerId: string;
  profileIconUrl?: string;
  logoUrl?: string;
  coverLogoUrl?: string;
  faviconUrl?: string;
  brandColorHex?: string;
  fontTheme?: string;
  platformBrandingRemoved: boolean;
}

export interface UpdateBrandingProfileCommand {
  profileIconUrl?: string;
  logoUrl?: string;
  coverLogoUrl?: string;
  faviconUrl?: string;
  brandColorHex?: string;
  fontTheme?: string;
  platformBrandingRemoved: boolean;
}

export interface WatermarkDto {
  id: string;
  name: string;
  type: WatermarkType;
  text?: string;
  fontFamily?: string;
  imageUrl?: string;
  opacity: number;
  scale: number;
  position: WatermarkPosition;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateWatermarkCommand {
  name: string;
  type: WatermarkType;
  text?: string;
  fontFamily?: string;
  imageUrl?: string;
  opacity: number;
  scale: number;
  position: WatermarkPosition;
  isDefault: boolean;
}

export interface UpdateWatermarkCommand {
  id: string;
  name: string;
  type: WatermarkType;
  text?: string;
  fontFamily?: string;
  imageUrl?: string;
  opacity: number;
  scale: number;
  position: WatermarkPosition;
  isDefault: boolean;
}

export interface CustomDomainDto {
  id: string;
  domainName: string;
  purpose: DomainPurpose;
  isVerified: boolean;
  sslStatus: SslStatus;
  sslExpiresAt?: string;
  dnsInstructions?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface CreateCustomDomainCommand {
  domainName: string;
  purpose: DomainPurpose;
}

export interface DocumentBrandingDto {
  id: string;
  documentType: DocumentType;
  headerImageUrl?: string;
  brandColorHex?: string;
  secondaryColorHex?: string;
  fontTheme?: string;
}

export interface UpsertDocumentBrandingCommand {
  documentType: DocumentType;
  headerImageUrl?: string;
  brandColorHex?: string;
  secondaryColorHex?: string;
  fontTheme?: string;
}

// --- Integrations ---

export interface ConfigureGoogleAnalyticsCommand {
  measurementId: string;
}

export interface ConfigureFacebookPixelCommand {
  pixelId: string;
}

export interface ConfigureInstagramFeedCommand {
  accessToken: string;
}

export interface InstagramFeedDto {
  posts: InstagramPostDto[];
}

export interface InstagramPostDto {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
}

export interface ConfigureStripeCommand {
  apiKey: string;
}

export interface ConfigurePayPalCommand {
  clientId: string;
  clientSecret: string;
}

export interface SaveCustomCodeInjectionCommand {
  location: CodeInjectionLocation;
  code: string;
}

export interface CodeInjectionDto {
  id: string;
  location: CodeInjectionLocation;
  code: string;
  createdAt: string;
}

export interface ConfigureGalleryAssistCommand {
  enabled: boolean;
  autoCategorizeSets: boolean;
}

// --- Payments ---

export interface RecordPaymentCommand {
  contactId?: string;
  invoiceId?: string;
  bookingId?: string;
  amountCents: number;
  tipCents: number;
  taxCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  isOffline: boolean;
}

export interface PaymentRecordDto {
  id: string;
  contactId?: string;
  invoiceId?: string;
  bookingId?: string;
  amountCents: number;
  feeCents: number;
  netAmountCents: number;
  tipCents: number;
  taxCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  externalPaymentId?: string;
  cardLast4?: string;
  description?: string;
  isOffline: boolean;
  isRefund: boolean;
  createdAt: string;
}

export interface RevenueDashboardDto {
  totalRevenueCents: number;
  netRevenueCents: number;
  totalFeesCents: number;
  totalRefundsCents: number;
  totalTipsCents: number;
  totalTaxCents: number;
  paymentMethodBreakdown: PaymentMethodBreakdownDto[];
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
  overdueInvoiceCount: number;
}

export interface PaymentMethodBreakdownDto {
  paymentMethod: PaymentMethod;
  totalCents: number;
  count: number;
}

export interface FinancingApplicationDto {
  id: string;
  requestedAmountCents: number;
  offeredAmountCents?: number;
  flatFeeCents?: number;
  repaymentPercentage?: number;
  repaidCents: number;
  status: string;
  approvedAt?: string;
  fundedAt?: string;
  repaidAt?: string;
  createdAt: string;
}

export interface ApplyForFinancingCommand {
  requestedAmountCents: number;
}

export interface CreateGiftCardCommand {
  amountCents: number;
  expiryDate?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
}

export interface RedeemGiftCardCommand {
  code: string;
  invoiceId?: string;
}

export interface PaymentTransactionListParams {
  method?: PaymentMethod;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentExportParams {
  from?: string;
  to?: string;
}

export interface RevenueDashboardParams {
  from?: string;
  to?: string;
}

// --- Plans ---

export interface PlanDto {
  id: string;
  product: string;
  tier: string;
  name: string;
  description?: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  isSuiteBundle: boolean;
  isActive: boolean;
  featureGates: PlanFeatureGateDto[];
}

export interface PlanFeatureGateDto {
  id: string;
  featureKey: string;
  featureValue: string;
  description?: string;
}

export interface CreatePlanRequest {
  product: string;
  tier: string;
  name: string;
  description?: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  isSuiteBundle: boolean;
  featureGates?: CreateFeatureGateRequest[];
}

export interface CreateFeatureGateRequest {
  featureKey: string;
  featureValue: string;
  description?: string;
}

export interface UpdatePlanRequest {
  name: string;
  description?: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  isActive: boolean;
}

export interface SubscriptionDto {
  id: string;
  planId: string;
  planName: string;
  planProduct: string;
  planTier: string;
  billingInterval: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceCents: number;
  prorationCreditCents: number;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  billingInterval: string;
}

export interface ChangeSubscriptionRequest {
  newPlanId: string;
  billingInterval: string;
}

export interface FeatureCheckResult {
  featureKey: string;
  isAllowed: boolean;
  currentValue?: string;
  message?: string;
}

export interface PlanListParams {
  product?: string;
}

// --- Webhooks ---

export interface WebhookSubscriptionDto {
  id: string;
  url: string;
  eventType: WebhookEventType;
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWebhookSubscriptionCommand {
  url: string;
  eventType: WebhookEventType;
  secret: string;
}
