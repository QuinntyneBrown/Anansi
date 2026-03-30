export enum ContactType {
  Lead = 'Lead',
  Client = 'Client',
  Other = 'Other',
}

export enum CollectionStatus {
  Draft = 'Draft',
  Published = 'Published',
  Hidden = 'Hidden',
  Expired = 'Expired',
}

export enum MediaType {
  Jpeg = 'Jpeg',
  Png = 'Png',
  Gif = 'Gif',
  Raw = 'Raw',
  Mp4 = 'Mp4',
  Mov = 'Mov',
  Avi = 'Avi',
  M4V = 'M4V',
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export enum ContractStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Signed = 'Signed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Declined = 'Declined',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  NoShow = 'NoShow',
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  ApplePay = 'ApplePay',
  GooglePay = 'GooglePay',
  PayPal = 'PayPal',
  BankTransfer = 'BankTransfer',
  Klarna = 'Klarna',
  Affirm = 'Affirm',
  TapToPay = 'TapToPay',
  Offline = 'Offline',
  GiftCard = 'GiftCard',
}

export enum NotificationEventType {
  PhotoDownloaded = 'PhotoDownloaded',
  StoreOrderPlaced = 'StoreOrderPlaced',
  FavoriteListUpdated = 'FavoriteListUpdated',
  ContractSigned = 'ContractSigned',
  InvoicePaymentReceived = 'InvoicePaymentReceived',
  SessionBooked = 'SessionBooked',
  QuoteAccepted = 'QuoteAccepted',
  MessageReceived = 'MessageReceived',
  FormSubmissionReceived = 'FormSubmissionReceived',
  GalleryExpiring = 'GalleryExpiring',
}

export enum PlanTier {
  Free = 'Free',
  Basic = 'Basic',
  Plus = 'Plus',
  Pro = 'Pro',
  Ultimate = 'Ultimate',
}

export enum PlanProduct {
  Gallery = 'Gallery',
  Website = 'Website',
  StudioManager = 'StudioManager',
  Suite = 'Suite',
}

export enum CoverStyle {
  Reef = 'Reef',
  West = 'West',
  Oakwood = 'Oakwood',
  Edge = 'Edge',
  Harbor = 'Harbor',
  Summit = 'Summit',
  Cascade = 'Cascade',
}

export enum ThemeMode {
  Light = 'Light',
  Dark = 'Dark',
}

export enum GridLayout {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
}

export enum DownloadResolution {
  Web640 = 'Web640',
  Web1024 = 'Web1024',
  Web2048 = 'Web2048',
  High3600 = 'High3600',
  Original = 'Original',
}

export enum ActivityType {
  Download = 'Download',
  Favorite = 'Favorite',
  PrivatePhoto = 'PrivatePhoto',
  EmailRegistration = 'EmailRegistration',
  Comment = 'Comment',
  View = 'View',
}

export enum GalleryLanguage {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Dutch = 'Dutch',
  ChineseSimplified = 'ChineseSimplified',
  Portuguese = 'Portuguese',
  Swedish = 'Swedish',
}

export enum SlideshowSpeed {
  Slow = 'Slow',
  Medium = 'Medium',
  Fast = 'Fast',
}

export enum ProductType {
  Print = 'Print',
  MountedPrint = 'MountedPrint',
  CanvasPrint = 'CanvasPrint',
  MetalPrint = 'MetalPrint',
  WoodPrint = 'WoodPrint',
  FramedPrint = 'FramedPrint',
  WallArt = 'WallArt',
  LargeFormat = 'LargeFormat',
  SquarePrint = 'SquarePrint',
  Standout = 'Standout',
  BambooPanel = 'BambooPanel',
  Album = 'Album',
  Book = 'Book',
  GreetingCard = 'GreetingCard',
  DigitalDownload = 'DigitalDownload',
  Package = 'Package',
  SelfFulfilled = 'SelfFulfilled',
}

export enum FulfillmentType {
  Lab = 'Lab',
  SelfFulfilled = 'SelfFulfilled',
  Digital = 'Digital',
}

export enum CouponType {
  PercentageOff = 'PercentageOff',
  FixedAmountOff = 'FixedAmountOff',
  FreeGiveaway = 'FreeGiveaway',
}

export enum CouponScope {
  EntireOrder = 'EntireOrder',
  SpecificItems = 'SpecificItems',
}

export enum BillingInterval {
  Monthly = 'Monthly',
  Annual = 'Annual',
}

export enum SubscriptionStatus {
  Active = 'Active',
  PastDue = 'PastDue',
  Cancelled = 'Cancelled',
  Trialing = 'Trialing',
  Paused = 'Paused',
}

export enum LabPartner {
  WHCC = 'WHCC',
  ProDPI = 'ProDPI',
  Millers = 'Millers',
  LoxleyColour = 'LoxleyColour',
}

export enum TemplateCategory {
  Business = 0,
  Portfolio = 1,
  OnePage = 2,
}

export enum WebsitePageType {
  Homepage = 0,
  Portfolio = 1,
  About = 2,
  Services = 3,
  Contact = 4,
  Pricing = 5,
  Gallery = 6,
  Blog = 7,
  Custom = 8,
}

export enum ElementType {
  Image = 0,
  Text = 1,
  VideoEmbed = 2,
  Button = 3,
  Shape = 4,
  Slider = 5,
  Carousel = 6,
  ImageGrid = 7,
  Accordion = 8,
  ClientGalleryBlock = 9,
  InstagramFeed = 10,
  CustomEmbed = 11,
  LandingPageBlock = 12,
  LayoutBlock = 13,
}

export enum QuestionType {
  ShortText = 'ShortText',
  LongText = 'LongText',
  MultipleChoice = 'MultipleChoice',
  Checkboxes = 'Checkboxes',
  Date = 'Date',
  Email = 'Email',
}

export enum Breakpoint {
  Desktop = 0,
  Tablet = 1,
  Mobile = 2,
}

export enum WebsiteStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum BlogPostStatus {
  Draft = 0,
  Published = 1,
  Scheduled = 2,
  Archived = 3,
}

export enum BlogLayoutType {
  Grid = 0,
  Stacked = 1,
  AlternatedCards = 2,
}

export enum AnimationType {
  None = 0,
  FadeIn = 1,
  ScaleUp = 2,
  SlideIn = 3,
  Unfold = 4,
}

export enum QuoteStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export enum RedirectType {
  Permanent301 = 301,
  Temporary302 = 302,
}

export enum WatermarkPosition {
  Center = 0,
  TopLeft = 1,
  TopCenter = 2,
  TopRight = 3,
  MiddleLeft = 4,
  MiddleRight = 5,
  BottomLeft = 6,
  BottomCenter = 7,
  BottomRight = 8,
}

export enum WatermarkType {
  Text = 0,
  Image = 1,
}

export enum DomainPurpose {
  Gallery = 0,
  Website = 1,
}

export enum SslStatus {
  Pending = 0,
  Active = 1,
  Expired = 2,
  Failed = 3,
}

export enum QuestionnaireStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Completed = 'Completed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export enum DocumentType {
  Contract = 0,
  Invoice = 1,
  Questionnaire = 2,
}

export enum SessionVisibility {
  Public = 'Public',
  Hidden = 'Hidden',
}

export enum NotificationCategory {
  ClientGallery = 'ClientGallery',
  Store = 'Store',
  StudioManager = 'StudioManager',
  Other = 'Other',
}

export enum NotificationDeliveryMethod {
  InApp = 'InApp',
  Email = 'Email',
  Push = 'Push',
}

export enum EmailDigestOption {
  RealTime = 'RealTime',
  DailySummary = 'DailySummary',
}

export enum WebhookEventType {
  BookingCreated = 'BookingCreated',
  PaymentReceived = 'PaymentReceived',
  ContractSigned = 'ContractSigned',
  FormSubmitted = 'FormSubmitted',
}

export enum CodeInjectionLocation {
  Header = 'Header',
  Footer = 'Footer',
}

export enum LabOrderStatus {
  Pending = 'Pending',
  Transmitted = 'Transmitted',
  InProduction = 'InProduction',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Failed = 'Failed',
}

export enum StorageWarningLevel {
  None = 'None',
  Warning80 = 'Warning80',
  Warning90 = 'Warning90',
  Critical95 = 'Critical95',
}

export enum SharePlatform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Pinterest = 'Pinterest',
  WhatsApp = 'WhatsApp',
  Messenger = 'Messenger',
  Threads = 'Threads',
  Email = 'Email',
  CopyLink = 'CopyLink',
}

export enum GalleryDisplayType {
  Grid = 0,
  FeaturedCollection = 1,
}

export enum InteracRequestStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export enum TaxRegistrationStatus {
  Voluntary = 'Voluntary',
  Mandatory = 'Mandatory',
  NotRegistered = 'NotRegistered',
}

export enum ExpenseCategory {
  Equipment = 'Equipment',
  Travel = 'Travel',
  Software = 'Software',
  Marketing = 'Marketing',
  Insurance = 'Insurance',
  Office = 'Office',
  Education = 'Education',
  Other = 'Other',
}

// --- Cultural Discovery (L27) ---

export enum SkinToneRange {
  Light = 'Light',
  Medium = 'Medium',
  Deep = 'Deep',
  VeryDeep = 'VeryDeep',
}

export enum PresetContext {
  Studio = 'Studio',
  Outdoor = 'Outdoor',
  Event = 'Event',
  GoldenHour = 'GoldenHour',
}

export enum PresetVisibility {
  Public = 'Public',
  Private = 'Private',
}

export enum EventCategory {
  Festival = 'Festival',
  Cultural = 'Cultural',
  Community = 'Community',
  Religious = 'Religious',
  Market = 'Market',
}

export enum EventRecurrence {
  OneTime = 'OneTime',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Annual = 'Annual',
}

export enum EventStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
