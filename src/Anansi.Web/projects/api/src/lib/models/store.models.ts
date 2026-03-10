import {
  CouponScope,
  CouponType,
  FulfillmentType,
  LabPartner,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from './enums';

// --- Products ---

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  isActive: boolean;
  labPartner?: LabPartner;
  labColorCorrectionEnabled: boolean;
  previewImageUrl?: string;
  digitalResolutionOptions?: string;
  variations: ProductVariationDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariationDto {
  id: string;
  name: string;
  sku?: string;
  costCents: number;
  markupCents: number;
  priceCents: number;
  isCustomPriced: boolean;
  isActive: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  labPartner?: LabPartner;
  labColorCorrectionEnabled: boolean;
  previewImageUrl?: string;
  digitalResolutionOptions?: string;
  variations?: CreateProductVariationRequest[];
}

export interface CreateProductVariationRequest {
  name: string;
  sku?: string;
  costCents: number;
  markupCents: number;
  priceCents: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  isActive: boolean;
  labPartner?: LabPartner;
  labColorCorrectionEnabled: boolean;
  previewImageUrl?: string;
  digitalResolutionOptions?: string;
}

export interface BulkMarkupRequest {
  productType: ProductType;
  markupPercentage: number;
  overrideCustomPriced: boolean;
}

export interface ProductListParams {
  productType?: ProductType;
  page?: number;
  pageSize?: number;
}

// --- Orders ---

export interface OrderDto {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  fulfillmentType: FulfillmentType;
  labPartner?: LabPartner;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  commissionCents: number;
  commissionPercentage: number;
  couponCode?: string;
  giftCardCode?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productVariationId?: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  selectedPhotoUrl?: string;
}

export interface CreateOrderRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  paymentMethod: PaymentMethod;
  shippingMethodId?: string;
  couponCode?: string;
  giftCardCode?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
  selectedPhotoUrl?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderListParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// --- Coupons ---

export interface CouponDto {
  id: string;
  code: string;
  couponType: CouponType;
  scope: CouponScope;
  percentageValue?: number;
  fixedAmountCents?: number;
  minimumOrderCents?: number;
  expirationDate?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  bannerText?: string;
  bannerColorHex?: string;
  showBanner: boolean;
  createdAt: string;
}

export interface CreateCouponRequest {
  code: string;
  couponType: CouponType;
  scope: CouponScope;
  percentageValue?: number;
  fixedAmountCents?: number;
  minimumOrderCents?: number;
  expirationDate?: string;
  usageLimit?: number;
  bannerText?: string;
  bannerColorHex?: string;
  showBanner: boolean;
}

// --- Gift Cards ---

export interface GiftCardDto {
  id: string;
  code: string;
  originalAmountCents: number;
  balanceCents: number;
  expiryDate?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateGiftCardRequest {
  amountCents: number;
  expiryDate?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
}

// --- Price Sheets ---

export interface PriceSheetDto {
  id: string;
  name: string;
  description?: string;
  isDownloadOnly: boolean;
  isDefault: boolean;
  items: PriceSheetItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceSheetItemDto {
  id: string;
  productVariationId: string;
  productVariationName: string;
  priceCents: number;
}

export interface CreatePriceSheetRequest {
  name: string;
  description?: string;
  isDownloadOnly: boolean;
  isDefault: boolean;
  items?: CreatePriceSheetItemRequest[];
}

export interface CreatePriceSheetItemRequest {
  productVariationId: string;
  priceCents: number;
}

// --- Shipping Methods ---

export interface ShippingMethodDto {
  id: string;
  name: string;
  description?: string;
  costCents: number;
  estimatedDelivery?: string;
  isActive: boolean;
}

export interface CreateShippingMethodRequest {
  name: string;
  description?: string;
  costCents: number;
  estimatedDelivery?: string;
}

// --- Tax Rates ---

export interface TaxRateDto {
  id: string;
  name: string;
  region: string;
  percentage: number;
  isActive: boolean;
}

export interface CreateTaxRateRequest {
  name: string;
  region: string;
  percentage: number;
}

// --- Labs ---

export interface LabPricingDto {
  labName: string;
  products: LabProductPricingDto[];
}

export interface LabProductPricingDto {
  productName: string;
  variations: LabVariationPricingDto[];
}

export interface LabVariationPricingDto {
  name: string;
  costCents: number;
}

export interface SubmitLabOrderCommand {
  orderId: string;
  labPartner: LabPartner;
}
