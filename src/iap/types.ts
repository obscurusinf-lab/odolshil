export interface PurchaseState {
  purchased: boolean;
  priceLabel: string | null;
  loading: boolean;
  error: string | null;
  /** Механизм покупок недоступен на этой платформе/сборке (например Expo Go). */
  unavailable: boolean;
}

export interface IapController {
  state: PurchaseState;
  buy: () => Promise<void>;
  restore: () => Promise<void>;
}

/** Один и тот же продукт под разными именами в двух консолях. */
export const PRODUCT_ID_IOS = 'odolshil_full_version';
export const PRODUCT_ID_RUSTORE = 'odolshil_full_version';

export const FALLBACK_PRICE_IOS = '$3.99';
export const FALLBACK_PRICE_RUSTORE = '399 ₽';
