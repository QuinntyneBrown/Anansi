import {
  BookingStatus,
  ContactType,
  ContractStatus,
  CouponType,
  InvoiceStatus,
  QuestionnaireStatus,
  QuestionType,
  QuoteStatus,
  SessionVisibility,
} from './enums';

// --- Contacts ---

export interface ContactDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  contactType: ContactType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactCommand {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  contactType: ContactType;
}

export interface UpdateContactCommand {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  contactType: ContactType;
}

export interface ImportContactsCommand {
  contacts: CreateContactCommand[];
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface ContactListParams {
  type?: ContactType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadCaptureFormDto {
  id: string;
  name: string;
  description?: string;
  defaultContactType: ContactType;
  slug: string;
  embedCode?: string;
  isActive: boolean;
  fields: LeadCaptureFormFieldDto[];
  createdAt: string;
}

export interface LeadCaptureFormFieldDto {
  id: string;
  label: string;
  fieldType: QuestionType;
  isRequired: boolean;
  sortOrder: number;
  options?: string;
}

export interface CreateLeadCaptureFormCommand {
  name: string;
  description?: string;
  defaultContactType: ContactType;
  fields: CreateLeadCaptureFormFieldRequest[];
}

export interface CreateLeadCaptureFormFieldRequest {
  label: string;
  fieldType: QuestionType;
  isRequired: boolean;
  sortOrder: number;
  options?: string;
}

export interface SubmitLeadCaptureFormCommand {
  slug: string;
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  responseData?: string;
}

// --- Contracts ---

export interface ContractDto {
  id: string;
  contactId?: string;
  contactName?: string;
  title: string;
  content: string;
  headerImageUrl?: string;
  status: ContractStatus;
  expiryDays?: number;
  sentAt?: string;
  expiresAt?: string;
  autoRemindersEnabled: boolean;
  reminderIntervalDays?: number;
  isTemplate: boolean;
  templateName?: string;
  fields: ContractFieldDto[];
  signatures: ContractSignatureDto[];
  createdAt: string;
}

export interface ContractFieldDto {
  id: string;
  label: string;
  defaultValue?: string;
  value?: string;
  isVariable: boolean;
  variableKey?: string;
  sortOrder: number;
}

export interface ContractSignatureDto {
  id: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signatureData?: string;
  signedAt?: string;
}

export interface CreateContractCommand {
  contactId?: string;
  title: string;
  content: string;
  headerImageUrl?: string;
  expiryDays?: number;
  autoRemindersEnabled: boolean;
  reminderIntervalDays?: number;
  isTemplate: boolean;
  templateName?: string;
  fields?: CreateContractFieldRequest[];
  signatures?: CreateContractSignatureRequest[];
}

export interface CreateContractFieldRequest {
  label: string;
  defaultValue?: string;
  isVariable: boolean;
  variableKey?: string;
  sortOrder: number;
}

export interface CreateContractSignatureRequest {
  signerName: string;
  signerEmail: string;
  signerRole: string;
}

export interface SignContractCommand {
  contractId: string;
  signatureId: string;
  signatureData: string;
}

export interface ContractListParams {
  isTemplate?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Invoices ---

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  title: string;
  contactId?: string;
  contactName?: string;
  status: InvoiceStatus;
  dueDate?: string;
  subtotalCents: number;
  taxRatePercent: number;
  taxAmountCents: number;
  discountCents: number;
  totalCents: number;
  paidCents: number;
  tipsEnabled: boolean;
  tipAmountCents: number;
  depositAmountCents?: number;
  autoRemindersEnabled: boolean;
  isTemplate: boolean;
  templateName?: string;
  lineItems: InvoiceLineItemDto[];
  paymentSchedules: InvoicePaymentScheduleDto[];
  createdAt: string;
}

export interface InvoiceLineItemDto {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  sortOrder: number;
}

export interface InvoicePaymentScheduleDto {
  id: string;
  label: string;
  amountCents: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  sortOrder: number;
}

export interface CreateInvoiceCommand {
  title: string;
  contactId?: string;
  dueDate?: string;
  taxRatePercent: number;
  discountCents: number;
  tipsEnabled: boolean;
  depositAmountCents?: number;
  autoRemindersEnabled: boolean;
  isTemplate: boolean;
  templateName?: string;
  lineItems: CreateInvoiceLineItemRequest[];
  paymentSchedules?: CreatePaymentScheduleRequest[];
}

export interface CreateInvoiceLineItemRequest {
  name: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  sortOrder: number;
}

export interface CreatePaymentScheduleRequest {
  label: string;
  amountCents: number;
  dueDate: string;
  sortOrder: number;
}

export interface InvoiceListParams {
  status?: InvoiceStatus;
  isTemplate?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Quotes ---

export interface QuoteDto {
  id: string;
  title: string;
  contactId?: string;
  contactName?: string;
  status: QuoteStatus;
  totalCents: number;
  sentAt?: string;
  acceptedAt?: string;
  generatedInvoiceId?: string;
  isTemplate: boolean;
  templateName?: string;
  items: QuoteItemDto[];
  createdAt: string;
}

export interface QuoteItemDto {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  sortOrder: number;
}

export interface CreateQuoteCommand {
  title: string;
  contactId?: string;
  projectId?: string;
  notes?: string;
  isTemplate: boolean;
  templateName?: string;
  items: CreateQuoteItemRequest[];
}

export interface CreateQuoteItemRequest {
  name: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  sortOrder: number;
}

export interface QuoteListParams {
  status?: QuoteStatus;
  search?: string;
  isTemplate?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Questionnaires ---

export interface QuestionnaireDto {
  id: string;
  title: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  status: QuestionnaireStatus;
  sentAt?: string;
  completedAt?: string;
  allowMultipleSubmissions: boolean;
  publicSlug?: string;
  expiryDays?: number;
  expiresAt?: string;
  autoRemindersEnabled: boolean;
  isTemplate: boolean;
  templateName?: string;
  questions: QuestionnaireQuestionDto[];
  createdAt: string;
}

export interface QuestionnaireQuestionDto {
  id: string;
  label: string;
  questionType: QuestionType;
  isRequired: boolean;
  sortOrder: number;
  options?: string;
}

export interface CreateQuestionnaireCommand {
  title: string;
  description?: string;
  contactId?: string;
  projectId?: string;
  allowMultipleSubmissions: boolean;
  expiryDays?: number;
  autoRemindersEnabled: boolean;
  reminderIntervalDays?: number;
  isTemplate: boolean;
  templateName?: string;
  questions: CreateQuestionnaireQuestionRequest[];
}

export interface CreateQuestionnaireQuestionRequest {
  label: string;
  questionType: QuestionType;
  isRequired: boolean;
  sortOrder: number;
  options?: string;
}

export interface SubmitQuestionnaireResponseCommand {
  questionnaireId: string;
  respondentEmail?: string;
  respondentName?: string;
  answersJson: string;
}

export interface QuestionnaireListParams {
  status?: QuestionnaireStatus;
  search?: string;
  isTemplate?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Projects ---

export interface ProjectBoardDto {
  stages: ProjectStageDto[];
}

export interface ProjectDto {
  id: string;
  name: string;
  projectType?: string;
  stageId: string;
  stageName: string;
  contactId?: string;
  contactName?: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProjectStageDto {
  id: string;
  name: string;
  sortOrder: number;
  projects: ProjectDto[];
}

export interface CreateProjectCommand {
  name: string;
  projectType?: string;
  stageId: string;
  contactId?: string;
}

export interface MoveProjectCommand {
  id: string;
  stageId: string;
  sortOrder: number;
}

export interface CreateStageCommand {
  name: string;
  sortOrder: number;
}

export interface UpdateStageCommand {
  id: string;
  name: string;
  sortOrder: number;
}

// --- Bookings ---

export interface SessionTypeDto {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  location?: string;
  visibility: SessionVisibility;
  sortOrder: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  requireManualConfirmation: boolean;
  isMiniSession: boolean;
  miniSessionGapMinutes: number;
  miniSessionSpotsPerSlot: number;
  availabilityWindows?: string;
  videoCallType?: string;
  requirePayment: boolean;
  depositAmountCents?: number;
  intakeDocumentIds?: string;
  coverImageUrl?: string;
  createdAt: string;
}

export interface CreateSessionTypeCommand {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  location?: string;
  visibility: SessionVisibility;
  sortOrder: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  requireManualConfirmation: boolean;
  isMiniSession: boolean;
  miniSessionGapMinutes: number;
  miniSessionSpotsPerSlot: number;
  availabilityWindows?: string;
  videoCallType?: string;
  requirePayment: boolean;
  depositAmountCents?: number;
  intakeDocumentIds?: string;
  coverImageUrl?: string;
}

export interface BookingRecordDto {
  id: string;
  sessionTypeId: string;
  sessionTypeName: string;
  contactId?: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  location?: string;
  videoCallLink?: string;
  amountPaidCents: number;
  couponCode?: string;
  discountCents: number;
  notes?: string;
  createdAt: string;
}

export interface CreateBookingCommand {
  sessionTypeId: string;
  contactId?: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  couponCode?: string;
}

export interface ConfirmBookingCommand {
  id: string;
  videoCallLink?: string;
}

export interface BookingCouponDto {
  id: string;
  code: string;
  couponType: CouponType;
  percentageValue?: number;
  fixedAmountCents?: number;
  expirationDate?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBookingCouponCommand {
  code: string;
  couponType: CouponType;
  percentageValue?: number;
  fixedAmountCents?: number;
  expirationDate?: string;
  usageLimit?: number;
}

export interface BookingListParams {
  status?: BookingStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
