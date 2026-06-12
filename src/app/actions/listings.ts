'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MAX_PHOTOS, STORAGE_BUCKET } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { listingPath } from '@/lib/utils';
import { validateListing } from '@/lib/validation';

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 4.5 * 1024 * 1024;
const MAX_LISTINGS_PER_DAY = 10;

export interface ListingActionResult {
  error: string;
}

export async function createListing(formData: FormData): Promise<ListingActionResult | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/post');

  // Posting requires a profile (it holds the WhatsApp number buyers contact).
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) redirect('/welcome?next=/post');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceRaw = String(formData.get('price_aed') ?? '');
  const price_aed = /^\d+$/.test(priceRaw) ? parseInt(priceRaw, 10) : NaN;
  const category = String(formData.get('category') ?? '');
  const emirate = String(formData.get('emirate') ?? '');
  const condition = String(formData.get('condition') ?? '');

  const validationError = validateListing({
    title,
    description,
    price_aed,
    category,
    emirate,
    condition,
  });
  if (validationError) return { error: validationError };

  // Anti-spam: cap how many listings one account can post per day.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .gte('created_at', dayAgo);
  if ((recentCount ?? 0) >= MAX_LISTINGS_PER_DAY) {
    return {
      error: `Daily limit reached — you can post up to ${MAX_LISTINGS_PER_DAY} listings per day. Try again tomorrow.`,
    };
  }

  const photos = formData
    .getAll('photos')
    .filter((p): p is File => p instanceof File && p.size > 0);
  if (photos.length > MAX_PHOTOS) {
    return { error: `Four photos max. It's karkooba, not a museum exhibit.` };
  }
  for (const photo of photos) {
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
      return { error: 'Photos must be JPEG, PNG or WebP.' };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: 'One of the photos is too big. Keep each under ~4 MB.' };
    }
  }

  const { data: listing, error: insertError } = await supabase
    .from('listings')
    .insert({ owner_id: user.id, title, description, price_aed, category, emirate, condition })
    .select('id, title')
    .single();
  if (insertError || !listing) {
    return { error: 'Could not post right now. Give it another shot in a moment.' };
  }

  // Upload photos; a failed photo shouldn't sink the listing.
  for (let i = 0; i < photos.length; i++) {
    const storagePath = `${user.id}/${listing.id}/${i}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, await photos[i].arrayBuffer(), {
        contentType: photos[i].type,
        upsert: false,
      });
    if (!uploadError) {
      await supabase
        .from('listing_photos')
        .insert({ listing_id: listing.id, storage_path: storagePath, position: i });
    }
  }

  revalidatePath('/');
  redirect(listingPath(listing.id, listing.title) + '?posted=1');
}

async function setStatus(listingId: string, status: 'active' | 'sold' | 'deleted') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/my-listings');

  await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId)
    .eq('owner_id', user.id);

  revalidatePath('/');
  revalidatePath('/my-listings');
}

export async function markSold(listingId: string) {
  await setStatus(listingId, 'sold');
}

export async function relist(listingId: string) {
  await setStatus(listingId, 'active');
}

export async function removeListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/my-listings');

  // Best-effort cleanup of the photo files before soft-deleting the listing.
  const { data: photos } = await supabase
    .from('listing_photos')
    .select('storage_path, listing_id, listings!inner(owner_id)')
    .eq('listing_id', listingId);
  const paths = (photos ?? []).map((p) => p.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    await supabase.from('listing_photos').delete().eq('listing_id', listingId);
  }

  await setStatus(listingId, 'deleted');
}
