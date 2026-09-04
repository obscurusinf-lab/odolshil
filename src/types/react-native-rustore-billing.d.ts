/**
 * Пакет установлен из GitHub-исходников (rustore-dev/react-native-rustore-billing-sdk),
 * у которых нет собранных `lib/typescript/*.d.ts` в репозитории (только исходники
 * src/*.tsx, генерация деклараций требует tsconfig.build.json, которого в репо нет).
 * JS выполняется из lib/commonjs, собранного локально из src/. Типы ниже —
 * ручная копия форм из src/types.ts и src/index.tsx официального пакета.
 */
declare module 'react-native-rustore-billing' {
  export enum ProductType {
    NON_CONSUMABLE = 'NON_CONSUMABLE',
    CONSUMABLE = 'CONSUMABLE',
    SUBSCRIPTION = 'SUBSCRIPTION',
  }

  export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
  }

  export interface SubscriptionPeriod {
    years: number;
    months: number;
    days: number;
  }

  export interface ProductSubscription {
    subscriptionPeriod?: SubscriptionPeriod;
    freeTrialPeriod?: SubscriptionPeriod;
    gracePeriod?: SubscriptionPeriod;
    introductoryPrice?: string;
    introductoryPriceAmount?: string;
    introductoryPricePeriod?: SubscriptionPeriod;
  }

  export interface Product {
    productId: string;
    productType?: ProductType;
    productStatus: ProductStatus;
    priceLabel?: string;
    price?: number;
    currency?: string;
    language?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    promoImageUrl?: string;
    subscription?: ProductSubscription;
  }

  export enum PurchaseState {
    CREATED = 'CREATED',
    INVOICE_CREATED = 'INVOICE_CREATED',
    CONFIRMED = 'CONFIRMED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    CONSUMED = 'CONSUMED',
    PAUSED = 'PAUSED',
    TERMINATED = 'TERMINATED',
  }

  export interface Purchase {
    purchaseId?: string;
    productId: string;
    productType?: ProductType;
    invoiceId?: string;
    language?: string;
    purchaseTime?: string;
    orderId?: string;
    amountLabel?: string;
    amount?: number;
    currency?: string;
    quantity?: number;
    purchaseState?: PurchaseState;
    developerPayload?: string;
    subscriptionToken?: string;
  }

  export enum PaymentResult {
    SUCCESS = 'SUCCESS',
    CANCELLED = 'CANCELLED',
    FAILURE = 'FAILURE',
  }

  export interface SuccessPaymentResult {
    orderId?: string;
    purchaseId: string;
    productId: string;
    invoiceId: string;
    sandbox: boolean;
    subscriptionToken?: string;
  }

  export interface SuccessPayment {
    type: PaymentResult.SUCCESS;
    response: SuccessPaymentResult;
  }

  export interface CancelledPaymentResult {
    purchaseId: string;
    sandbox: boolean;
  }

  export interface CancelledPayment {
    type: PaymentResult.CANCELLED;
    response: CancelledPaymentResult;
  }

  export interface FailurePaymentResult {
    purchaseId?: string;
    invoiceId?: string;
    orderId?: string;
    quantity?: number;
    productId?: string;
    errorCode?: number;
    sandbox: boolean;
  }

  export interface FailurePayment {
    type: PaymentResult.FAILURE;
    response: FailurePaymentResult;
  }

  interface RustoreBillingModule {
    init: (params: { consoleApplicationId: string; deeplinkScheme: string }) => void;
    checkPurchasesAvailability: () => Promise<boolean | string>;
    getProducts: (productIds: string[]) => Promise<Product[]>;
    getPurchases: () => Promise<Purchase[]>;
    getPurchaseInfo: (purchaseId: string) => Promise<Purchase>;
    purchaseProduct: (params: {
      productId: string;
      orderId?: string;
      quantity?: number;
      developerPayload?: string;
    }) => Promise<SuccessPayment | CancelledPayment | FailurePayment>;
    confirmPurchase: (params: { purchaseId: string; developerPayload?: string }) => Promise<boolean>;
    deletePurchase: (purchaseId: string) => Promise<boolean>;
    isRuStoreInstalled: () => Promise<boolean>;
  }

  const RustoreBillingClient: RustoreBillingModule;
  export default RustoreBillingClient;
}
