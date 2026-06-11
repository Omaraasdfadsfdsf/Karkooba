export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', emoji: '🔌' },
  { id: 'furniture', label: 'Furniture', emoji: '🪑' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'tools', label: 'Tools', emoji: '🔧' },
  { id: 'books', label: 'Books & Media', emoji: '📚' },
  { id: 'kids', label: 'Kids & Toys', emoji: '🧸' },
  { id: 'misc', label: 'Mystery / Misc', emoji: '❓' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;

export type Emirate = (typeof EMIRATES)[number];

export const CONDITIONS = ['like_new', 'good', 'worn', 'parts'] as const;

export type Condition = (typeof CONDITIONS)[number];

export function isCondition(value: string): value is Condition {
  return (CONDITIONS as readonly string[]).includes(value);
}

export const MAX_PHOTOS = 4;
export const MAX_TITLE = 60;
export const MAX_DESCRIPTION = 500;
export const MAX_PRICE_AED = 999;
export const PHOTO_MAX_DIMENSION = 1200;
export const STORAGE_BUCKET = 'listing-photos';

export function categoryLabel(id: string): string {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.label : 'Mystery / Misc';
}

export function categoryEmoji(id: string): string {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.emoji : '📦';
}

export function isCategory(value: string): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

export function isEmirate(value: string): value is Emirate {
  return (EMIRATES as readonly string[]).includes(value);
}
