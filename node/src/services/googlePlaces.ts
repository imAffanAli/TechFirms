import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('google-places');

/** True when a Google Places key is configured. The whole ratings feature no-ops without it. */
export function isGoogleRatingsEnabled(): boolean {
  return !!env.GOOGLE_PLACES_API_KEY;
}

export interface GoogleRating {
  placeId: string;
  rating: number; // 0..5
  ratingCount: number;
  mapsUri: string | null; // link back for attribution
  matchedName: string | null; // for sanity-checking the match
}

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

interface SearchTextResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
  }>;
}

/**
 * Look up a company on Google (Places API New — Text Search) and return its aggregate
 * star rating + rating count. We request only the rating fields — never review text.
 * Returns null if the key is missing, the request fails, or no rated place matches.
 */
export async function fetchGoogleRating(query: string): Promise<GoogleRating | null> {
  const key = env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  let res: Response;
  try {
    res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        // Field mask controls both the response and the billing SKU. Rating fields only.
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });
  } catch (e) {
    logger.warn({ err: e, query }, 'google places request failed');
    return null;
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    logger.warn({ status: res.status, query, detail: detail.slice(0, 300) }, 'google places non-200');
    return null;
  }

  const data = (await res.json()) as SearchTextResponse;
  const p = data.places?.[0];
  if (!p || typeof p.rating !== 'number') return null;

  return {
    placeId: p.id,
    rating: p.rating,
    ratingCount: p.userRatingCount ?? 0,
    mapsUri: p.googleMapsUri ?? null,
    matchedName: p.displayName?.text ?? null,
  };
}

export interface PlaceResult {
  placeId: string;
  name: string;
  website: string | null;
  rating: number | null;
  ratingCount: number;
  mapsUri: string | null;
  primaryType: string | null;
  address: string | null;
}

interface SearchListResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    websiteUri?: string;
    primaryType?: string;
    formattedAddress?: string;
  }>;
}

/**
 * Discover businesses via Google Places (New) Text Search — used to grow the directory with
 * real companies (name, website, rating). Returns up to `maxResults` places per query.
 */
export async function searchPlaces(query: string, maxResults = 20): Promise<PlaceResult[]> {
  const key = env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  let res: Response;
  try {
    res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.primaryType,places.formattedAddress',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: Math.min(20, maxResults) }),
    });
  } catch (e) {
    logger.warn({ err: e, query }, 'places search failed');
    return [];
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    logger.warn({ status: res.status, query, detail: detail.slice(0, 300) }, 'places search non-200');
    return [];
  }

  const data = (await res.json()) as SearchListResponse;
  return (data.places ?? []).map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? '',
    website: p.websiteUri ?? null,
    rating: typeof p.rating === 'number' ? p.rating : null,
    ratingCount: p.userRatingCount ?? 0,
    mapsUri: p.googleMapsUri ?? null,
    primaryType: p.primaryType ?? null,
    address: p.formattedAddress ?? null,
  }));
}
