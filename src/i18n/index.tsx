import * as Localization from 'expo-localization';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getSetting, setSetting } from '@/db/settings';
import { TranslationKey, en, ru } from './translations';

export type LanguageSetting = 'system' | 'ru' | 'en';
export type ResolvedLanguage = 'ru' | 'en';

const dictionaries: Record<ResolvedLanguage, Record<TranslationKey, string>> = { ru, en };

function resolveSystemLanguage(): ResolvedLanguage {
  const code = Localization.getLocales()[0]?.languageCode;
  return code === 'ru' ? 'ru' : 'en';
}

function resolve(setting: LanguageSetting): ResolvedLanguage {
  return setting === 'system' ? resolveSystemLanguage() : setting;
}

interface I18nContextValue {
  language: ResolvedLanguage;
  languageSetting: LanguageSetting;
  setLanguageSetting: (setting: LanguageSetting) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [languageSetting, setLanguageSettingState] = useState<LanguageSetting>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSetting('language').then((value) => {
      if (value === 'ru' || value === 'en' || value === 'system') {
        setLanguageSettingState(value);
      }
      setLoaded(true);
    });
  }, []);

  const setLanguageSetting = useCallback((setting: LanguageSetting) => {
    setLanguageSettingState(setting);
    setSetting('language', setting);
  }, []);

  const language = useMemo(() => resolve(languageSetting), [languageSetting]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = dictionaries[language][key] ?? key;
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [language]
  );

  if (!loaded) return null;

  return (
    <I18nContext.Provider value={{ language, languageSetting, setLanguageSetting, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
