import { useCallback, useEffect, useRef, useState } from 'react';
import RustoreBillingClient from 'react-native-rustore-billing';

import { isExpoGo } from './isExpoGo';
import { isPurchased, setPurchased } from './purchaseFlag';
import { FALLBACK_PRICE_RUSTORE, IapController, PRODUCT_ID_RUSTORE } from './types';

const RUSTORE_CONSOLE_APP_ID = 'REPLACE_WITH_RUSTORE_CONSOLE_APP_ID';

/**
 * Android: официальный react-native-rustore-billing (RuStore Billing SDK).
 * НЕ проверено на устройстве — в песочнице нет Android-тулчейна, эмулятора
 * с установленным RuStore и тестового аккаунта в консоли разработчика.
 * Перед релизом: подставить настоящий consoleApplicationId (см. константу
 * выше), завести non-consumable продукт `odolshil_full_version` в консоли
 * RuStore, собрать dev client (`eas build --profile development`) и
 * проверить покупку на реальном устройстве с установленным RuStore.
 *
 * Если SDK не удастся собрать за разумное время — запасной вариант из ТЗ:
 * версия для RuStore выходит платной сразу, без встроенной покупки, и этот
 * файл просто не используется (весь экран настроек читает `unavailable`).
 */
export function useIap(): IapController {
  const [purchased, setPurchasedState] = useState(false);
  const [priceLabel, setPriceLabel] = useState<string | null>(FALLBACK_PRICE_RUSTORE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (isExpoGo()) {
      // Нативного модуля RuStore Billing в Expo Go нет — не пытаемся его вызывать.
      isPurchased().then((value) => {
        setPurchasedState(value);
        setUnavailable(true);
        setLoading(false);
      });
      return;
    }
    (async () => {
      try {
        if (!initialized.current) {
          RustoreBillingClient.init({
            consoleApplicationId: RUSTORE_CONSOLE_APP_ID,
            deeplinkScheme: 'odolshil',
          });
          initialized.current = true;
        }

        const available = await RustoreBillingClient.checkPurchasesAvailability();
        if (available !== true) {
          setUnavailable(true);
          setLoading(false);
          return;
        }

        const [purchases, products, storedFlag] = await Promise.all([
          RustoreBillingClient.getPurchases(),
          RustoreBillingClient.getProducts([PRODUCT_ID_RUSTORE]),
          isPurchased(),
        ]);

        const confirmedElsewhere = purchases.some(
          (p) => p.productId === PRODUCT_ID_RUSTORE && p.purchaseState === 'CONFIRMED'
        );
        const isNowPurchased = storedFlag || confirmedElsewhere;
        if (isNowPurchased !== storedFlag) await setPurchased(isNowPurchased);
        setPurchasedState(isNowPurchased);

        const product = products.find((p) => p.productId === PRODUCT_ID_RUSTORE);
        if (product?.priceLabel) setPriceLabel(product.priceLabel);
      } catch (err: any) {
        setUnavailable(true);
        setError(err?.message ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buy = useCallback(async () => {
    if (isExpoGo()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await RustoreBillingClient.purchaseProduct({ productId: PRODUCT_ID_RUSTORE });
      if (result.type === 'SUCCESS') {
        await setPurchased(true);
        setPurchasedState(true);
      } else if (result.type === 'FAILURE') {
        setError(String(result.response?.errorCode ?? 'purchase_failed'));
      }
    } catch (err: any) {
      setError(err?.message ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    if (isExpoGo()) return;
    setLoading(true);
    setError(null);
    try {
      const purchases = await RustoreBillingClient.getPurchases();
      const confirmed = purchases.some(
        (p) => p.productId === PRODUCT_ID_RUSTORE && p.purchaseState === 'CONFIRMED'
      );
      await setPurchased(confirmed);
      setPurchasedState(confirmed);
      if (!confirmed) setError('not_found');
    } catch (err: any) {
      setError(err?.message ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state: { purchased, priceLabel, loading, error, unavailable },
    buy,
    restore,
  };
}
