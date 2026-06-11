import { STORAGE_BUCKET } from './constants';
import type { Dict } from './i18n/dictionaries';

export function fmtPrice(priceAed: number): string {
  return priceAed === 0 ? 'FREE' : `AED ${priceAed}`;
}

/** Locale-aware price label, e.g. "AED 30" / "د.إ 30" / "FREE" / "مجاناً". */
export function fmtPriceL(priceAed: number, dict: Dict): string {
  return priceAed === 0 ? dict.card.free : `${dict.card.aed} ${priceAed}`;
}

/** URL-safe slug from a listing title, e.g. "Desk fan — loud!" -> "desk-fan-loud" */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug || 'item';
}

/**
 * Normalize a UAE phone number to WhatsApp's 971XXXXXXXXX format.
 * Accepts "0501234567", "501234567", "971501234567", "+971 50 123 4567"...
 * Returns null when the number can't be a valid UAE number.
 */
export function normalizeUaePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = '971' + digits.slice(1);
  else if (!digits.startsWith('971')) digits = '971' + digits;
  return /^971[0-9]{8,9}$/.test(digits) ? digits : null;
}

export function whatsAppLink(phone: string, title: string, priceAed: number): string {
  const text = encodeURIComponent(
    `Hi! I saw your '${title}' on KARKOOBA for ${priceAed === 0 ? 'FREE' : `AED ${priceAed}`}. Is it still available?`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function photoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

export function listingPath(id: string, title: string): string {
  return `/listing/${id}/${slugify(title)}`;
}

export function fmtDate(iso: string, locale: 'en' | 'ar' = 'en'): string {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtTime(iso: string, locale: 'en' | 'ar' = 'en'): string {
  return new Date(iso).toLocaleTimeString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
