/**
 * Fetch public Google Business / Maps reviews as JSON.
 *
 * Google does not let you scrape Maps/Search pages, and the official Places API
 * only returns up to 5 reviews. This script uses a supported API instead:
 *
 *   1. SERPAPI_API_KEY     — full public review history + reviewer details (best)
 *   2. OUTSCRAPER_API_KEY  — full public review history (also accepts Maps URLs)
 *   3. GOOGLE_PLACES_API_KEY — official Places API (New), max 5 reviews
 *
 * Prefer a Google Maps place URL. It contains a stable data id
 * (`0x…:0x…`). A google.com/search knowledge-panel URL only has a query string.
 *
 * Usage:
 *   npx tsx scripts/fetch-google-reviews.ts "<maps-or-search-url>"
 *   npx tsx scripts/fetch-google-reviews.ts "<url>" --out reviews.json
 *   npx tsx scripts/fetch-google-reviews.ts "<url>" --max 200 --sort newest
 *   npx tsx scripts/fetch-google-reviews.ts --place-id ChIJ... --provider places
 *
 * Keys go in .env.local (see .env.local.example).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Provider = "serpapi" | "outscraper" | "places";
type Sort = "relevant" | "newest" | "highest" | "lowest";

type ParsedInput = {
  raw: string;
  kind: "maps" | "search" | "place_id" | "data_id" | "query";
  name: string | null;
  dataId: string | null;
  placeId: string | null;
  query: string | null;
  lat: number | null;
  lng: number | null;
  mapsUrl: string | null;
};

type ReviewAuthor = {
  name: string | null;
  profileUrl: string | null;
  photoUrl: string | null;
  contributorId: string | null;
  isLocalGuide: boolean | null;
  reviewCount: number | null;
  photoCount: number | null;
};

type PlaceReview = {
  id: string | null;
  rating: number | null;
  text: string | null;
  language: string | null;
  publishedAt: string | null;
  lastEditedAt: string | null;
  relativeTime: string | null;
  likes: number | null;
  mapsUrl: string | null;
  photos: string[];
  subRatings: Record<string, number> | null;
  ownerResponse: {
    text: string | null;
    publishedAt: string | null;
  } | null;
  author: ReviewAuthor;
};

type PlaceInfo = {
  name: string | null;
  address: string | null;
  placeId: string | null;
  dataId: string | null;
  mapsUrl: string | null;
  phone: string | null;
  website: string | null;
  types: string[];
  rating: number | null;
  reviewCount: number | null;
  location: { lat: number; lng: number } | null;
  reviewsPerScore: Record<string, number> | null;
};

type ReviewsResult = {
  fetchedAt: string;
  source: Provider;
  input: ParsedInput;
  limitation: string | null;
  place: PlaceInfo;
  reviewCountReturned: number;
  reviews: PlaceReview[];
};

const SERPAPI_SORT: Record<Sort, string> = {
  relevant: "qualityScore",
  newest: "newestFirst",
  highest: "ratingHigh",
  lowest: "ratingLow",
};

const PLACES_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "types",
  "primaryType",
  "businessStatus",
  "reviews",
  "reviewSummary",
].join(",");

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function usage(): string {
  return `Fetch public Google Maps / Business reviews as JSON.

Usage:
  npx tsx scripts/fetch-google-reviews.ts "<url>"
  npx tsx scripts/fetch-google-reviews.ts "<url>" --out reviews.json --max 200 --sort newest

Options:
  --out <file>          Write JSON to a file (also printed to stdout)
  --max <n>             Max reviews to fetch (default 500; Places API still caps at 5)
  --sort <value>        relevant | newest | highest | lowest  (default newest)
  --hl <lang>           Language code (default en)
  --provider <name>     serpapi | outscraper | places
  --place-id <id>       Google Place ID (ChIJ...)
  --data-id <id>        Maps data id (0x...:0x...)
  --help                Show this message

Environment (put in .env.local):
  SERPAPI_API_KEY          Full review history  https://serpapi.com
  OUTSCRAPER_API_KEY       Full review history  https://outscraper.com
  GOOGLE_PLACES_API_KEY    Official API, max 5 reviews

Prefer a maps.google.com/maps/place/... URL. Search URLs like
google.com/search?q=... only give a query, not a stable place id.`;
}

function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
      continue;
    }
    positional.push(arg);
  }
  return { flags, positional };
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function decodeMaybe(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value.replace(/\+/g, " ");
  }
}

function looksLikePlaceId(value: string): boolean {
  return /^ChI[JIj][\w-]+$/.test(value.trim());
}

function looksLikeDataId(value: string): boolean {
  return /^0x[0-9a-fA-F]+:0x[0-9a-fA-F]+$/.test(value.trim());
}

function extractDataId(text: string): string | null {
  const match = text.match(/0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/);
  return match ? match[0] : null;
}

async function followRedirects(url: string): Promise<string> {
  if (!/maps\.app\.goo\.gl|goo\.gl\/maps|\bg\.page\b/i.test(url)) return url;
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: { "User-Agent": "BarbellistReviewFetcher/1.0" },
  });
  return res.url || url;
}

function parseGoogleInput(rawInput: string): ParsedInput {
  const raw = rawInput.trim();
  const empty: ParsedInput = {
    raw,
    kind: "query",
    name: null,
    dataId: null,
    placeId: null,
    query: raw,
    lat: null,
    lng: null,
    mapsUrl: null,
  };

  if (looksLikePlaceId(raw)) {
    return { ...empty, kind: "place_id", placeId: raw, query: null };
  }
  if (looksLikeDataId(raw)) {
    return { ...empty, kind: "data_id", dataId: raw, query: null };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return empty;
  }

  const href = url.href;
  const dataId = extractDataId(href);
  const placeIdParam =
    url.searchParams.get("place_id") ||
    url.searchParams.get("placeid") ||
    (url.searchParams.get("q")?.startsWith("place_id:")
      ? url.searchParams.get("q")!.slice("place_id:".length)
      : null);

  const placePath = href.match(/\/maps\/place\/([^/@?#]+)/);
  const name = placePath ? decodeMaybe(placePath[1]) : null;

  const coordMatch =
    href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) ||
    href.match(/\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const lat = coordMatch ? Number(coordMatch[1]) : null;
  const lng = coordMatch ? Number(coordMatch[2]) : null;

  const isMaps =
    /google\.[^/]+\/maps/i.test(href) ||
    url.hostname.includes("maps.google") ||
    Boolean(dataId && name);
  const isSearch =
    url.pathname === "/search" || url.searchParams.has("q") && !isMaps;

  if (isMaps || dataId || looksLikePlaceId(placeIdParam ?? "")) {
    return {
      raw,
      kind: "maps",
      name,
      dataId,
      placeId: placeIdParam && looksLikePlaceId(placeIdParam) ? placeIdParam : null,
      query: name,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      mapsUrl: href,
    };
  }

  const q = url.searchParams.get("q");
  return {
    raw,
    kind: "search",
    name: q ? decodeMaybe(q) : name,
    dataId,
    placeId: placeIdParam && looksLikePlaceId(placeIdParam) ? placeIdParam : null,
    query: q ? decodeMaybe(q) : name,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    mapsUrl: null,
  };
}

function log(message: string) {
  process.stderr.write(`${message}\n`);
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }
  if (!res.ok) {
    const detail =
      typeof body === "object" && body
        ? JSON.stringify(body)
        : String(body).slice(0, 500);
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`);
  }
  return body;
}

function emptyPlace(): PlaceInfo {
  return {
    name: null,
    address: null,
    placeId: null,
    dataId: null,
    mapsUrl: null,
    phone: null,
    website: null,
    types: [],
    rating: null,
    reviewCount: null,
    location: null,
    reviewsPerScore: null,
  };
}

function emptyAuthor(): ReviewAuthor {
  return {
    name: null,
    profileUrl: null,
    photoUrl: null,
    contributorId: null,
    isLocalGuide: null,
    reviewCount: null,
    photoCount: null,
  };
}

function contributorIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/contrib\/(\d+)/);
  return match ? match[1] : null;
}

function isoFromUnix(seconds: unknown): string | null {
  const n = asNumber(seconds);
  if (n == null) return null;
  const ms = n > 10_000_000_000 ? n : n * 1000;
  return new Date(ms).toISOString();
}

async function fetchSerpApi(
  input: ParsedInput,
  opts: { apiKey: string; max: number; sort: Sort; hl: string },
): Promise<ReviewsResult> {
  let dataId = input.dataId;
  let placeId = input.placeId;

  if (!dataId && !placeId) {
    const query = input.query || input.name;
    if (!query) {
      throw new Error("Need a Maps URL, data id, place id, or search query.");
    }
    log(`Resolving place via SerpAPI Maps search: ${query}`);
    const search = new URL("https://serpapi.com/search.json");
    search.searchParams.set("engine", "google_maps");
    search.searchParams.set("type", "search");
    search.searchParams.set("q", query);
    search.searchParams.set("hl", opts.hl);
    search.searchParams.set("api_key", opts.apiKey);
    if (input.lat != null && input.lng != null) {
      search.searchParams.set("ll", `@${input.lat},${input.lng},17z`);
    }
    const found = (await getJson(search.toString())) as Record<string, unknown>;
    const locals = Array.isArray(found.local_results)
      ? (found.local_results as Record<string, unknown>[])
      : [];
    const placeResult =
      (found.place_results as Record<string, unknown> | undefined) ?? locals[0];
    if (!placeResult) {
      throw new Error(`No Google Maps place found for "${query}".`);
    }
    dataId = asString(placeResult.data_id) ?? dataId;
    placeId = asString(placeResult.place_id) ?? placeId;
  }

  const reviews: PlaceReview[] = [];
  let place = emptyPlace();
  let nextPageToken: string | null = null;
  let page = 0;

  while (reviews.length < opts.max) {
    page += 1;
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_maps_reviews");
    url.searchParams.set("hl", opts.hl);
    url.searchParams.set("api_key", opts.apiKey);
    url.searchParams.set("sort_by", SERPAPI_SORT[opts.sort]);
    if (dataId) url.searchParams.set("data_id", dataId);
    else if (placeId) url.searchParams.set("place_id", placeId);
    if (nextPageToken) {
      url.searchParams.set("next_page_token", nextPageToken);
      url.searchParams.set("num", "20");
    }

    log(`SerpAPI reviews page ${page} (${reviews.length} so far)…`);
    const json = (await getJson(url.toString())) as Record<string, unknown>;
    const error = asString(json.error);
    if (error) throw new Error(`SerpAPI: ${error}`);

    const info = json.place_info as Record<string, unknown> | undefined;
    if (info && page === 1) {
      place = {
        ...place,
        name: asString(info.title) ?? place.name,
        address: asString(info.address) ?? place.address,
        rating: asNumber(info.rating),
        reviewCount: asNumber(info.reviews),
        types: asString(info.type) ? [asString(info.type)!] : place.types,
        dataId: dataId ?? place.dataId,
        placeId: placeId ?? place.placeId,
        mapsUrl: input.mapsUrl,
      };
    }

    const pageReviews = Array.isArray(json.reviews)
      ? (json.reviews as Record<string, unknown>[])
      : [];
    for (const item of pageReviews) {
      if (reviews.length >= opts.max) break;
      const user = (item.user as Record<string, unknown> | undefined) ?? {};
      const profileUrl = asString(user.link);
      const extracted = item.extracted_snippet as Record<string, unknown> | undefined;
      const details = item.details as Record<string, unknown> | undefined;
      const subRatings =
        details && typeof details === "object"
          ? Object.fromEntries(
              Object.entries(details)
                .map(([k, v]) => [k, asNumber(v)])
                .filter((entry): entry is [string, number] => entry[1] != null),
            )
          : null;
      reviews.push({
        id: asString(item.review_id),
        rating: asNumber(item.rating),
        text:
          asString(extracted?.original) ??
          asString(item.snippet) ??
          asString(item.text),
        language: null,
        publishedAt: asString(item.iso_date),
        lastEditedAt: asString(item.iso_date_of_last_edit),
        relativeTime: asString(item.date),
        likes: asNumber(item.likes),
        mapsUrl: asString(item.link),
        photos: Array.isArray(item.images)
          ? item.images.map((img) => asString(img)).filter((v): v is string => Boolean(v))
          : [],
        subRatings: subRatings && Object.keys(subRatings).length ? subRatings : null,
        ownerResponse: item.response
          ? {
              text:
                asString((item.response as Record<string, unknown>).snippet) ??
                asString((item.response as Record<string, unknown>).text),
              publishedAt:
                asString((item.response as Record<string, unknown>).iso_date) ??
                asString((item.response as Record<string, unknown>).date),
            }
          : null,
        author: {
          name: asString(user.name),
          profileUrl,
          photoUrl: asString(user.thumbnail),
          contributorId:
            asString(user.contributor_id) ?? contributorIdFromUrl(profileUrl),
          isLocalGuide:
            typeof user.local_guide === "boolean" ? user.local_guide : null,
          reviewCount: asNumber(user.reviews),
          photoCount: asNumber(user.photos),
        },
      });
    }

    const pagination = json.serpapi_pagination as Record<string, unknown> | undefined;
    nextPageToken = asString(pagination?.next_page_token);
    if (!nextPageToken || pageReviews.length === 0) break;
  }

  return {
    fetchedAt: new Date().toISOString(),
    source: "serpapi",
    input,
    limitation: null,
    place,
    reviewCountReturned: reviews.length,
    reviews,
  };
}

async function fetchOutscraper(
  input: ParsedInput,
  opts: { apiKey: string; max: number; sort: Sort; hl: string },
): Promise<ReviewsResult> {
  const query =
    input.dataId ||
    input.placeId ||
    input.mapsUrl ||
    input.query ||
    input.name;
  if (!query) {
    throw new Error("Need a Maps URL, data id, place id, or search query.");
  }

  const sortMap: Record<Sort, string> = {
    relevant: "most_relevant",
    newest: "newest",
    highest: "highest_rating",
    lowest: "lowest_rating",
  };

  log(`Outscraper reviews for ${query} (limit ${opts.max})…`);
  const url = new URL("https://api.outscraper.com/google-maps-reviews");
  url.searchParams.set("query", query);
  url.searchParams.set("reviewsLimit", String(opts.max));
  url.searchParams.set("limit", "1");
  url.searchParams.set("async", "false");
  url.searchParams.set("language", opts.hl);
  url.searchParams.set("sort", sortMap[opts.sort]);

  const json = (await getJson(url.toString(), {
    headers: { "X-API-KEY": opts.apiKey },
  })) as Record<string, unknown>;

  const rows = Array.isArray(json.data)
    ? (json.data as Record<string, unknown>[])
    : [];
  const row = rows[0];
  if (!row) throw new Error("Outscraper returned no place data.");

  const reviewsRaw = Array.isArray(row.reviews_data)
    ? (row.reviews_data as Record<string, unknown>[])
    : [];

  const location =
    asNumber(row.latitude) != null && asNumber(row.longitude) != null
      ? { lat: asNumber(row.latitude)!, lng: asNumber(row.longitude)! }
      : input.lat != null && input.lng != null
        ? { lat: input.lat, lng: input.lng }
        : null;

  const reviews: PlaceReview[] = reviewsRaw.slice(0, opts.max).map((item) => {
    const profileUrl = asString(item.author_link);
    const photos = Array.isArray(item.review_img_urls)
      ? item.review_img_urls.map((img) => asString(img)).filter((v): v is string => Boolean(v))
      : asString(item.review_img_url)
        ? [asString(item.review_img_url)!]
        : [];
    return {
      id: asString(item.review_id) ?? asString(item.reviews_id),
      rating: asNumber(item.review_rating),
      text: asString(item.review_text),
      language: asString(item.review_language),
      publishedAt:
        isoFromUnix(item.review_timestamp) ??
        (asString(item.review_datetime_utc)
          ? new Date(`${item.review_datetime_utc} UTC`).toISOString()
          : null),
      lastEditedAt: null,
      relativeTime: null,
      likes: asNumber(item.review_likes),
      mapsUrl: asString(item.review_link),
      photos,
      subRatings: null,
      ownerResponse: asString(item.owner_answer)
        ? {
            text: asString(item.owner_answer),
            publishedAt:
              asString(item.owner_answer_timestamp_datetime_utc) ??
              isoFromUnix(item.owner_answer_timestamp),
          }
        : null,
      author: {
        name: asString(item.author_title),
        profileUrl,
        photoUrl: asString(item.author_image),
        contributorId: asString(item.author_id) ?? contributorIdFromUrl(profileUrl),
        isLocalGuide: null,
        reviewCount: asNumber(item.author_reviews_count),
        photoCount: asNumber(item.author_photos_count),
      },
    };
  });

  const score = row.reviews_per_score as Record<string, number> | undefined;

  return {
    fetchedAt: new Date().toISOString(),
    source: "outscraper",
    input,
    limitation: null,
    place: {
      name: asString(row.name),
      address: asString(row.full_address) ?? asString(row.address),
      placeId: asString(row.place_id),
      dataId: asString(row.google_id) ?? input.dataId,
      mapsUrl: asString(row.location_link) ?? input.mapsUrl,
      phone: asString(row.phone),
      website: asString(row.site) ?? asString(row.website),
      types: asString(row.type) ? [asString(row.type)!] : [],
      rating: asNumber(row.rating),
      reviewCount: asNumber(row.reviews),
      location,
      reviewsPerScore: score ?? null,
    },
    reviewCountReturned: reviews.length,
    reviews,
  };
}

async function placesSearchText(
  apiKey: string,
  input: ParsedInput,
  hl: string,
): Promise<string> {
  if (input.placeId) return input.placeId;
  const query = input.query || input.name;
  if (!query) {
    throw new Error("Need a Maps URL with a place name, or --place-id.");
  }

  log(`Resolving Place ID via Places Text Search: ${query}`);
  const body: Record<string, unknown> = { textQuery: query, languageCode: hl };
  if (input.lat != null && input.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: input.lat, longitude: input.lng },
        radius: 400,
      },
    };
  }

  const json = (await getJson("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify(body),
  })) as Record<string, unknown>;

  const places = Array.isArray(json.places)
    ? (json.places as Record<string, unknown>[])
    : [];
  const id = asString(places[0]?.id);
  if (!id) throw new Error(`Places API found no match for "${query}".`);
  return id;
}

async function fetchPlaces(
  input: ParsedInput,
  opts: { apiKey: string; sort: Sort; hl: string },
): Promise<ReviewsResult> {
  const placeId = await placesSearchText(opts.apiKey, input, opts.hl);
  const reviewsSort = opts.sort === "newest" ? "NEWEST" : "MOST_RELEVANT";
  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", opts.hl);
  url.searchParams.set("reviewsSort", reviewsSort);

  log("Fetching Place Details (max 5 reviews)…");
  const json = (await getJson(url.toString(), {
    headers: {
      "X-Goog-Api-Key": opts.apiKey,
      "X-Goog-FieldMask": PLACES_FIELD_MASK,
    },
  })) as Record<string, unknown>;

  const displayName = json.displayName as Record<string, unknown> | undefined;
  const location = json.location as Record<string, unknown> | undefined;
  const lat = asNumber(location?.latitude);
  const lng = asNumber(location?.longitude);
  const rawReviews = Array.isArray(json.reviews)
    ? (json.reviews as Record<string, unknown>[])
    : [];

  const reviews: PlaceReview[] = rawReviews.map((item) => {
    const author = (item.authorAttribution as Record<string, unknown> | undefined) ?? {};
    const text = item.text as Record<string, unknown> | undefined;
    const original = item.originalText as Record<string, unknown> | undefined;
    const profileUrl = asString(author.uri);
    return {
      id: asString(item.name),
      rating: asNumber(item.rating),
      text: asString(original?.text) ?? asString(text?.text),
      language: asString(original?.languageCode) ?? asString(text?.languageCode),
      publishedAt: asString(item.publishTime),
      lastEditedAt: null,
      relativeTime: asString(item.relativePublishTimeDescription),
      likes: null,
      mapsUrl: asString(item.googleMapsUri),
      photos: [],
      subRatings: null,
      ownerResponse: null,
      author: {
        ...emptyAuthor(),
        name: asString(author.displayName),
        profileUrl,
        photoUrl: asString(author.photoUri),
        contributorId: contributorIdFromUrl(profileUrl),
      },
    };
  });

  return {
    fetchedAt: new Date().toISOString(),
    source: "places",
    input: { ...input, placeId },
    limitation:
      "Google Places API returns at most 5 reviews. Use SERPAPI_API_KEY or OUTSCRAPER_API_KEY for the full public review list. If you own the listing, use the Google Business Profile API instead.",
    place: {
      name: asString(displayName?.text),
      address: asString(json.formattedAddress),
      placeId: asString(json.id) ?? placeId,
      dataId: input.dataId,
      mapsUrl: asString(json.googleMapsUri) ?? input.mapsUrl,
      phone:
        asString(json.internationalPhoneNumber) ??
        asString(json.nationalPhoneNumber),
      website: asString(json.websiteUri),
      types: Array.isArray(json.types)
        ? json.types.filter((t): t is string => typeof t === "string")
        : [],
      rating: asNumber(json.rating),
      reviewCount: asNumber(json.userRatingCount),
      location: lat != null && lng != null ? { lat, lng } : null,
      reviewsPerScore: null,
    },
    reviewCountReturned: reviews.length,
    reviews,
  };
}

function pickProvider(explicit: string | undefined): Provider {
  if (explicit) {
    if (explicit === "serpapi" || explicit === "outscraper" || explicit === "places") {
      return explicit;
    }
    throw new Error(`Unknown provider "${explicit}". Use serpapi, outscraper, or places.`);
  }
  if (process.env.SERPAPI_API_KEY?.trim()) return "serpapi";
  if (process.env.OUTSCRAPER_API_KEY?.trim()) return "outscraper";
  if (process.env.GOOGLE_PLACES_API_KEY?.trim()) return "places";
  throw new Error(
    [
      "No review API key found.",
      "Add one of these to .env.local:",
      "  SERPAPI_API_KEY=...        (full public reviews — recommended)",
      "  OUTSCRAPER_API_KEY=...     (full public reviews)",
      "  GOOGLE_PLACES_API_KEY=...  (official, max 5 reviews)",
      "",
      "Google Maps/Search pages cannot be scraped directly (ToS + bot protection).",
      "If this is YOUR gym listing, Google Business Profile API returns every review.",
    ].join("\n"),
  );
}

async function main() {
  loadEnvLocal();
  const { flags, positional } = parseArgs(process.argv.slice(2));
  if (flags.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const sortRaw = String(flags.sort ?? "newest");
  if (!["relevant", "newest", "highest", "lowest"].includes(sortRaw)) {
    throw new Error("--sort must be relevant, newest, highest, or lowest");
  }
  const sort = sortRaw as Sort;
  const hl = String(flags.hl ?? "en");
  const max = Math.max(1, Number(flags.max ?? 500) || 500);
  const out = typeof flags.out === "string" ? flags.out : null;
  const provider = pickProvider(
    typeof flags.provider === "string" ? flags.provider : undefined,
  );

  let raw = positional[0] ?? "";
  if (typeof flags["place-id"] === "string") raw = String(flags["place-id"]);
  if (typeof flags["data-id"] === "string") raw = String(flags["data-id"]);
  if (!raw) {
    process.stderr.write(`${usage()}\n`);
    process.exit(1);
  }

  raw = await followRedirects(raw);
  const input = parseGoogleInput(raw);

  if (typeof flags["place-id"] === "string") {
    input.placeId = String(flags["place-id"]);
    input.kind = "place_id";
  }
  if (typeof flags["data-id"] === "string") {
    input.dataId = String(flags["data-id"]);
    input.kind = "data_id";
  }

  log(
    `Provider=${provider} kind=${input.kind} name=${input.name ?? "?"} dataId=${input.dataId ?? "none"}`,
  );
  if (input.kind === "search" && !input.dataId && !input.placeId) {
    log(
      "Note: this is a Google Search URL. A Maps place URL is more reliable because it includes the 0x…:0x… id.",
    );
  }

  let result: ReviewsResult;
  if (provider === "serpapi") {
    result = await fetchSerpApi(input, {
      apiKey: process.env.SERPAPI_API_KEY!.trim(),
      max,
      sort,
      hl,
    });
  } else if (provider === "outscraper") {
    result = await fetchOutscraper(input, {
      apiKey: process.env.OUTSCRAPER_API_KEY!.trim(),
      max,
      sort,
      hl,
    });
  } else {
    result = await fetchPlaces(input, {
      apiKey: process.env.GOOGLE_PLACES_API_KEY!.trim(),
      sort,
      hl,
    });
  }

  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (out) {
    const path = resolve(process.cwd(), out);
    writeFileSync(path, json, "utf8");
    log(`Wrote ${result.reviewCountReturned} reviews to ${path}`);
  }
  process.stdout.write(json);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
