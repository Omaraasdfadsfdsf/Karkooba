import type { CategoryId, Condition, Emirate } from './constants';

export type ListingStatus = 'active' | 'sold' | 'deleted';

export interface Profile {
  id: string;
  display_name: string;
  phone: string;
  emirate: Emirate;
  created_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  storage_path: string;
  position: number;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price_aed: number;
  category: CategoryId;
  emirate: Emirate;
  condition: Condition;
  status: ListingStatus;
  created_at: string;
}

export interface ListingWithPhotos extends Listing {
  listing_photos: Pick<ListingPhoto, 'storage_path' | 'position'>[];
}

export interface ListingWithSeller extends ListingWithPhotos {
  profiles: Pick<Profile, 'display_name' | 'phone' | 'emirate'> | null;
}
