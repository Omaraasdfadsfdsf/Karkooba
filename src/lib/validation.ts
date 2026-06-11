import {
  MAX_DESCRIPTION,
  MAX_PRICE_AED,
  MAX_TITLE,
  isCategory,
  isCondition,
  isEmirate,
} from './constants';
import { normalizeUaePhone } from './utils';

export interface ListingInput {
  title: string;
  description: string;
  price_aed: number;
  category: string;
  emirate: string;
  condition: string;
}

/** Shared by the post form (client) and the server action. Returns an error message or null. */
export function validateListing(input: ListingInput): string | null {
  const title = input.title.trim();
  if (title.length < 3) return 'Give it a name — even "weird metal thing" works (3+ characters).';
  if (title.length > MAX_TITLE) return `Keep the title under ${MAX_TITLE} characters. Save the saga for the description.`;
  if (!Number.isInteger(input.price_aed) || input.price_aed < 0) {
    return 'Set a price in AED (0 = free).';
  }
  if (input.price_aed > MAX_PRICE_AED) {
    return "Over AED 999? That's not karkooba anymore, that's a luxury item.";
  }
  if (!isCategory(input.category)) return 'Pick a category for your treasure.';
  if (!isEmirate(input.emirate)) return 'Which emirate is it gathering dust in?';
  if (!isCondition(input.condition)) return 'Tell buyers what condition it is in.';
  if (input.description.trim().length > MAX_DESCRIPTION) {
    return `Description is over ${MAX_DESCRIPTION} characters. We admire the honesty, but trim it down.`;
  }
  return null;
}

export interface ProfileInput {
  display_name: string;
  phone: string;
  emirate: string;
}

/** Validates profile fields. Returns { error } or { phone } with the normalized number. */
export function validateProfile(input: ProfileInput): { error: string } | { phone: string } {
  const name = input.display_name.trim();
  if (name.length < 2 || name.length > 40) {
    return { error: 'Pick a display name between 2 and 40 characters.' };
  }
  const phone = normalizeUaePhone(input.phone);
  if (!phone) {
    return { error: 'That WhatsApp number doesn\'t look right. Try the format 0501234567.' };
  }
  if (!isEmirate(input.emirate)) {
    return { error: 'Pick your emirate so buyers know where the goods are.' };
  }
  return { phone };
}
