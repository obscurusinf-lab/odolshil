import { useCallback } from 'react';

import { isPurchased } from './purchaseFlag';
import { IapController } from './types';

/** Заглушка для платформ без покупок (web). Активные экраны на iOS/Android используют .ios/.android варианты этого хука. */
export function useIap(): IapController {
  const restore = useCallback(async () => {}, []);
  const buy = useCallback(async () => {}, []);

  return {
    state: { purchased: false, priceLabel: null, loading: false, error: null, unavailable: true },
    buy,
    restore,
  };
}

export { isPurchased };
