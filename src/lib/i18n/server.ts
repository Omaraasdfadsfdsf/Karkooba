import { cookies } from 'next/headers';
import { dictionaries, isLocale, type Dict, type Locale } from './dictionaries';

export const LOCALE_COOKIE = 'karkooba-lang';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : 'en';
}

export async function getDict(): Promise<{ dict: Dict; locale: Locale }> {
  const locale = await getLocale();
  return { dict: dictionaries[locale], locale };
}
