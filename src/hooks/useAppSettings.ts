import { useCallback, useEffect, useState } from 'react';

import { getSettingNumber, setSetting } from '@/db/settings';
import { DEFAULT_TIME_OF_DAY, TimeOfDay } from '@/notifications';

export interface AppSettings {
  leadDays: 0 | 1 | 3;
  time: TimeOfDay;
}

const LEAD_DAYS_KEY = 'leadDays';
const HOUR_KEY = 'notifyHour';
const MINUTE_KEY = 'notifyMinute';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    leadDays: 0,
    time: DEFAULT_TIME_OF_DAY,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [leadDays, hour, minute] = await Promise.all([
        getSettingNumber(LEAD_DAYS_KEY),
        getSettingNumber(HOUR_KEY),
        getSettingNumber(MINUTE_KEY),
      ]);
      setSettings({
        leadDays: (leadDays as 0 | 1 | 3) ?? 0,
        time: {
          hour: hour ?? DEFAULT_TIME_OF_DAY.hour,
          minute: minute ?? DEFAULT_TIME_OF_DAY.minute,
        },
      });
      setLoaded(true);
    })();
  }, []);

  const setLeadDays = useCallback(async (leadDays: 0 | 1 | 3) => {
    await setSetting(LEAD_DAYS_KEY, String(leadDays));
    setSettings((prev) => ({ ...prev, leadDays }));
  }, []);

  const setTime = useCallback(async (time: TimeOfDay) => {
    await setSetting(HOUR_KEY, String(time.hour));
    await setSetting(MINUTE_KEY, String(time.minute));
    setSettings((prev) => ({ ...prev, time }));
  }, []);

  return { settings, loaded, setLeadDays, setTime };
}
