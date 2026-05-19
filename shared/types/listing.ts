export type ListingStatus = 'active' | 'expired' | 'sold' | 'deleted';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'parts';

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  public_id: string;
  sort_order: number;
  is_primary: boolean;
  uploaded_at: string;
}

export interface ListingAttribute {
  key: string;
  value: string;
}

export interface Listing {
  id: string;
  user_id: string;
  category_id: string;
  location_id: string;
  title: string;
  body: string;
  price: string | null;
  currency: string;
  condition: ListingCondition | null;
  status: ListingStatus;
  is_free: boolean;
  remote_ok: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  images?: ListingImage[];
  attributes?: ListingAttribute[];
  category_name?: string;
  category_slug?: string;
  location_city?: string;
  location_region?: string;
  seller_name?: string;
  seller_avatar?: string;
}

export interface CreateListingBody {
  category_id: string;
  location_id: string;
  title: string;
  body: string;
  price?: number;
  currency?: string;
  condition?: ListingCondition;
  is_free?: boolean;
  remote_ok?: boolean;
  image_ids?: string[];       // Cloudinary public_ids already uploaded
  attributes?: ListingAttribute[];
  images?: Array<{ url: string; public_id: string }>;
}

export interface ListingsQuery {
  category?: string;          // slug
  location?: string;          // location id
  q?: string;                 // search term
  min_price?: string;
  max_price?: string;
  condition?: ListingCondition;
  is_free?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: string;
  limit?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface UpdateListingBody extends Partial<CreateListingBody> {}
