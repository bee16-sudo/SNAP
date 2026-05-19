import { ListingCondition } from './listing';

export interface SearchFilters {
  q?: string;
  category?: string;       // category slug
  location?: string;       // location id
  min_price?: string;
  max_price?: string;
  condition?: ListingCondition;
  is_free?: string;        // 'true' | 'false'
  remote_ok?: string;      // 'true' | 'false'
  sort?: SortOption;
  page?: string;
  limit?: string;
}

export type SortOption = 'relevance' | 'newest' | 'price_asc' | 'price_desc';

export interface SearchResult {
  id: string;
  title: string;
  price: string | null;
  currency: string;
  is_free: boolean;
  condition: string | null;
  status: string;
  created_at: string;
  category_name: string;
  category_slug: string;
  location_city: string;
  location_region: string;
  seller_name: string;
  primary_image: string | null;
  headline: string;     // highlighted snippet from title
  snippet: string;      // highlighted snippet from body
  rank: number;         // ts_rank score
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pages: number;
  query: string;
  filters_applied: Partial<SearchFilters>;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'location';
}
