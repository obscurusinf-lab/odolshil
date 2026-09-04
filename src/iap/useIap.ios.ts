import { useCallback, useEffect, useState } from 'react';
import { useIAP } from 'react-native-iap';

import { isExpoGo } from './isExpoGo';
import { isPurchased, setPurchased } from './purchaseFlag';
import { FALLBACK_PRICE_IOS, IapController, PRODUCT_ID_IOS } from './types';

/**
 * iOS: react-native-iap (StoreKit 2, через Nitro Modules).
 * НЕ проверено на устройстве — в песочнице нет macOS/Xcode/аккаунта
 * App Store Connect с настроенным non-consumable продуктом. Перед
 * релизом: завести продукт `odolshil_full_version` в App Store Connect,
 * собрать dev client через EAS и пройти покупку в песочнице StoreKit.
 */
export function useIap(): IapController {
  // isExpoGo() не меняется в течение жизни процесса — ветвление хуков стабильно между рендерами.
  return isExpoGo() ? useIapExpoGoStub() : useIapNative();
}

/** В Expo Go нативного модуля StoreKit нет — не пытаемся его вызывать, просто показываем "недоступно". */
function useIapExpoGoStub(): IapController {
  const noop = useCallback(async () => {}, []);
  return {
    state: { purchased: false, priceLabel: FALLBACK_PRICE_IOS, loading: false, error: null, unavailable: true },
    buy: noop,
    restore: noop,
  };
}

function useIapNative(): IapController {
  const [purchased, setPurchasedState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase: any) => {
      await finishTransaction({ purchase, isConsumable: false });
      await setPurchased(true);
      setPurchasedState(true);
      setLoading(false);
    },
    onPurchaseError: (err: any) => {
      setError(err?.message ?? null);
      setLoading(false);
    },
  });

  useEffect(() => {
    isPurchased().then((value) => {
      setPurchasedState(value);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [PRODUCT_ID_IOS], type: 'in-app' }).catch(() => {});
    }
  }, [connected, fetchProducts]);

  const buy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await requestPurchase({ request: { ios: { sku: PRODUCT_ID_IOS } }, type: 'in-app' });
    } catch (err: any) {
      setError(err?.message ?? null);
      setLoading(false);
    }
  }, [requestPurchase]);

  const restore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // На iOS покупки восстанавливаются через повторный requestPurchase —
      // StoreKit сам вернёт уже купленный non-consumable без повторного списания.
      await requestPurchase({ request: { ios: { sku: PRODUCT_ID_IOS } }, type: 'in-app' });
    } catch (err: any) {
      setError(err?.message ?? null);
      setLoading(false);
    }
  }, [requestPurchase]);

  const product = products.find((p: any) => p.id === PRODUCT_ID_IOS);

  return {
    state: {
      purchased,
      priceLabel: product?.displayPrice ?? FALLBACK_PRICE_IOS,
      loading,
      error,
      unavailable: false,
    },
    buy,
    restore,
  };
}
