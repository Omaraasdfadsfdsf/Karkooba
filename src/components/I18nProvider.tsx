'use client';

import { createContext, useContext } from 'react';
import { en, type Dict, type Locale } from '@/lib/i18n/dictionaries';

const I18nContext = createContext<{ dict: Dict; locale: Locale }>({
  dict: en,
  locale: 'en',
});

export function I18nProvider({
  dict,
  locale,
  children,
}: {
  dict: Dict;
  locale: Locale;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ dict, locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
