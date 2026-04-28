import {
  Collectable,
  Exhibition,
  Artwork,
  Event,
  EventRegistration,
  Booking,
  ShopOrder,
  PageAssets,
  GalleryImage,
  PressRelease,
  Review,
} from '../types';

import {
  EXHIBITIONS,
  ARTWORKS,
  DEFAULT_ASSETS,
} from './mockData';

import { COLLECTABLES } from '../constants';

/* ================================
   API BASE URL
================================ */
const envBackendUrl = (import.meta as any)?.env?.VITE_BACKEND_URL as
  | string
  | undefined;
const API_BASE =
  envBackendUrl && envBackendUrl.trim().length > 0
    ? `${envBackendUrl.replace(/\/$/, '')}/api/data`
    : '/api/data';

/* ================================
   LOCAL STORAGE KEYS
================================ */
const STORAGE_KEYS = {
  COLLECTABLES: 'MOCA_COLLECTABLES',
  EXHIBITIONS: 'MOCA_EXHIBITIONS',
  ARTWORKS: 'MOCA_ARTWORKS',
  EVENTS: 'MOCA_EVENTS',
  EVENT_REGISTRATIONS: 'MOCA_EVENT_REGISTRATIONS',
  REVIEWS: 'MOCA_REVIEWS',
  PAGE_ASSETS: 'MOCA_ASSETS',
  BOOKINGS: 'MOCA_BOOKINGS',
  ORDERS: 'MOCA_ORDERS',
  GALLERY_IMAGES: 'MOCA_GALLERY_IMAGES',
  PRESS_RELEASES: 'MOCA_PRESS_RELEASES',
};

/* ================================
   LOCAL STORAGE HELPERS
================================ */
const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (
  key: string,
  data: any,
  dispatchEvent: boolean = true
) => {
  localStorage.setItem(key, JSON.stringify(data));

  if (dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent('MOCA_DB_UPDATE', {
        detail: { store: key },
      })
    );
  }
};

/* ================================
   API HELPERS
================================ */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const adminApiKey = (import.meta as any)?.env
    ?.VITE_ADMIN_API_KEY as string | undefined;
  const staffMode =
    localStorage.getItem('MOCA_STAFF_MODE') === 'true';

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(adminApiKey && staffMode
        ? { 'x-admin-key': adminApiKey }
        : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `API request failed (${response.status}): ${
        text || response.statusText
      }`
    );
  }

  return response.json();
};

const syncGet = async <T>(
  endpoint: string,
  storageKey: string,
  fallback: T
): Promise<T> => {
  try {
    const data = await apiRequest(endpoint);
    setLocal(storageKey, data, false);
    return data as T;
  } catch (error) {
    console.warn(`[API FALLBACK] ${endpoint}`, error);
    return getLocal(storageKey, fallback);
  }
};

const syncUpsert = async (
  endpoint: string,
  storageKey: string,
  item: any,
  idField = 'id'
) => {
  const originalList = getLocal<any[]>(storageKey, []);
  const list = [...originalList];

  const index = list.findIndex(
    (i) => i[idField] === item[idField]
  );

  if (index > -1) {
    list[index] = item;
  } else {
    list.unshift(item);
  }

  setLocal(storageKey, list);

  try {
    await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  } catch (error) {
    console.error(`[API WRITE] ${endpoint}`, error);
    setLocal(storageKey, originalList);
  }
};

const syncDelete = async (
  endpoint: string,
  storageKey: string,
  id: string
) => {
  const originalList = getLocal<any[]>(storageKey, []);

  setLocal(
    storageKey,
    originalList.filter((i) => i.id !== id)
  );

  try {
    await apiRequest(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`[API DELETE] ${endpoint}`, error);
    setLocal(storageKey, originalList);
  }
};

/* ================================
   CONNECTION STATUS
================================ */
export const checkDatabaseConnection = async () => {
  const url =
    envBackendUrl && envBackendUrl.trim().length > 0
      ? envBackendUrl.replace(/\/$/, '')
      : undefined;

  if (!url) {
    return {
      isConnected: false,
      mode: 'LOCAL ONLY',
      url: 'localStorage',
      latencyMs: null as number | null,
      timestamp: Date.now(),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  const start = performance.now();

  try {
    const resp = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - start);
    const ok = resp.ok;
    return {
      isConnected: ok,
      mode: ok ? 'REMOTE API' : 'REMOTE API (ERROR)',
      url,
      latencyMs,
      timestamp: Date.now(),
    };
  } catch (_err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      isConnected: false,
      mode: 'REMOTE API (DOWN)',
      url,
      latencyMs,
      timestamp: Date.now(),
    };
  } finally {
    clearTimeout(timeout);
  }
};

/* ================================
   INITIAL BOOTSTRAP
================================ */
export const bootstrapMuseumData = async () => {
  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS))
    setLocal(
      STORAGE_KEYS.EXHIBITIONS,
      EXHIBITIONS,
      false
    );

  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS))
    setLocal(
      STORAGE_KEYS.ARTWORKS,
      ARTWORKS,
      false
    );

  if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES))
    setLocal(
      STORAGE_KEYS.COLLECTABLES,
      COLLECTABLES,
      false
    );

  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS))
    setLocal(
      STORAGE_KEYS.PAGE_ASSETS,
      DEFAULT_ASSETS,
      false
    );

  if (!localStorage.getItem(STORAGE_KEYS.GALLERY_IMAGES))
    setLocal(
      STORAGE_KEYS.GALLERY_IMAGES,
      [],
      false
    );

  if (!localStorage.getItem(STORAGE_KEYS.PRESS_RELEASES))
    setLocal(
      STORAGE_KEYS.PRESS_RELEASES,
      [],
      false
    );
};

/* ================================
   API
================================ */

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';

export const getPageAssets = () =>
  syncGet<PageAssets>(
    '/page-assets',
    STORAGE_KEYS.PAGE_ASSETS,
    DEFAULT_ASSETS
  );

export const savePageAssets = async (
  assets: PageAssets
) => {
  const original = getLocal<PageAssets>(
    STORAGE_KEYS.PAGE_ASSETS,
    DEFAULT_ASSETS
  );
  setLocal(STORAGE_KEYS.PAGE_ASSETS, assets);

  try {
    await apiRequest('/page-assets', {
      method: 'POST',
      body: JSON.stringify(assets),
    });
  } catch (error) {
    console.error('[API WRITE] /page-assets', error);
    setLocal(STORAGE_KEYS.PAGE_ASSETS, original);
  }
};

export const getExhibitions = () =>
  syncGet<Exhibition[]>(
    '/exhibitions',
    STORAGE_KEYS.EXHIBITIONS,
    EXHIBITIONS
  );

export const saveExhibition = (ex: Exhibition) =>
  syncUpsert(
    '/exhibitions',
    STORAGE_KEYS.EXHIBITIONS,
    ex
  );

export const getArtworks = () =>
  syncGet<Artwork[]>(
    '/artworks',
    STORAGE_KEYS.ARTWORKS,
    ARTWORKS
  );

export const getCollectables = () =>
  syncGet<Collectable[]>(
    '/collectables',
    STORAGE_KEYS.COLLECTABLES,
    COLLECTABLES
  );

export const saveCollectable = (c: Collectable) =>
  syncUpsert(
    '/collectables',
    STORAGE_KEYS.COLLECTABLES,
    c
  );

export const deleteCollectable = (id: string) =>
  syncDelete(
    '/collectables',
    STORAGE_KEYS.COLLECTABLES,
    id
  );

const normalizeEvent = (raw: any): Event => ({
  id: String(raw?.id ?? ''),
  title: String(raw?.title ?? ''),
  type: String(raw?.type ?? ''),
  date: String(raw?.date ?? ''),
  location: String(raw?.location ?? ''),
  imageUrl: String(raw?.imageUrl ?? raw?.image_url ?? ''),
  description:
    typeof raw?.description === 'string'
      ? raw.description
      : undefined,
});

export const getEvents = async () => {
  try {
    const data = await apiRequest('/events');
    const normalized = Array.isArray(data)
      ? data.map(normalizeEvent)
      : [];
    setLocal(STORAGE_KEYS.EVENTS, normalized, false);
    return normalized;
  } catch (error) {
    console.warn('[API FALLBACK] /events', error);
    return getLocal<Event[]>(STORAGE_KEYS.EVENTS, []);
  }
};

export const saveEvent = (e: Event) =>
  syncUpsert('/events', STORAGE_KEYS.EVENTS, e);

export const deleteEvent = (id: string) =>
  syncDelete('/events', STORAGE_KEYS.EVENTS, id);

export const getEventRegistrations = () =>
  (async () => {
    const normalize = (raw: any): EventRegistration => ({
      id: String(raw?.id ?? ''),
      eventId: String(raw?.eventId ?? raw?.event_id ?? ''),
      eventTitle: String(
        raw?.eventTitle ?? raw?.event_title ?? ''
      ),
      name: String(raw?.name ?? ''),
      email: String(raw?.email ?? ''),
      phone:
        typeof raw?.phone === 'string' && raw.phone.trim()
          ? raw.phone
          : undefined,
      quantity: Number(raw?.quantity ?? 1),
      timestamp: Number(raw?.timestamp ?? Date.now()),
      status:
        (raw?.status as EventRegistration['status']) ??
        'Pending',
    });

    try {
      const data = await apiRequest(
        '/event-registrations'
      );
      const normalized = Array.isArray(data)
        ? data.map(normalize)
        : [];
      setLocal(
        STORAGE_KEYS.EVENT_REGISTRATIONS,
        normalized,
        false
      );
      return normalized;
    } catch (error) {
      console.warn(
        '[API FALLBACK] /event-registrations',
        error
      );
      return getLocal<EventRegistration[]>(
        STORAGE_KEYS.EVENT_REGISTRATIONS,
        []
      );
    }
  })();

export const saveEventRegistration = (
  r: EventRegistration
) =>
  syncUpsert(
    '/event-registrations',
    STORAGE_KEYS.EVENT_REGISTRATIONS,
    r
  );

export const updateEventRegistrationStatus =
  async (
    id: string,
    status: EventRegistration['status']
  ) => {
    const originalList =
      getLocal<EventRegistration[]>(
        STORAGE_KEYS.EVENT_REGISTRATIONS,
        []
      );
    setLocal(
      STORAGE_KEYS.EVENT_REGISTRATIONS,
      originalList.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );

    try {
      await apiRequest(
        `/event-registrations/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error(
        '[API WRITE] /event-registrations/:id/status',
        error
      );
      setLocal(
        STORAGE_KEYS.EVENT_REGISTRATIONS,
        originalList
      );
    }
  };

export const getBookings = () =>
  syncGet<Booking[]>(
    '/bookings',
    STORAGE_KEYS.BOOKINGS,
    []
  );

export const saveBooking = (b: Booking) =>
  syncUpsert(
    '/bookings',
    STORAGE_KEYS.BOOKINGS,
    b
  );

export const getShopOrders = () =>
  syncGet<ShopOrder[]>(
    '/shop-orders',
    STORAGE_KEYS.ORDERS,
    []
  );

export const updateOrderStatus = async (
  id: string,
  status: ShopOrder['status']
) => {
  const originalList = getLocal<ShopOrder[]>(
    STORAGE_KEYS.ORDERS,
    []
  );
  setLocal(
    STORAGE_KEYS.ORDERS,
    originalList.map((o) =>
      o.id === id ? { ...o, status } : o
    )
  );

  try {
    await apiRequest(`/shop-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error(
      '[API WRITE] /shop-orders/:id/status',
      error
    );
    setLocal(STORAGE_KEYS.ORDERS, originalList);
  }
};

export const saveShopOrder = async (
  o: ShopOrder
) => {
  await syncUpsert(
    '/shop-orders',
    STORAGE_KEYS.ORDERS,
    o
  );

  try {
    await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: o }),
    });
  } catch (error) {
    console.error(
      'Error triggering order email:',
      error
    );
  }
};

export const getDashboardAnalytics = async () => {
  const [orders, bookings] = await Promise.all([
    getShopOrders(),
    getBookings(),
  ]);

  const totalRevenue =
    orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    ) +
    bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

  const totalTickets = bookings.reduce(
    (sum, b) =>
      sum +
      (b.tickets?.adult || 0) +
      (b.tickets?.student || 0) +
      (b.tickets?.child || 0),
    0
  );

  const recentActivity = [...orders, ...bookings]
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 10);

  return {
    totalRevenue,
    totalTickets,
    orderCount: orders.length,
    recentActivity,
  };
};

/* ================================
   GALLERY
================================ */

export const getGalleryImages = () =>
  syncGet<GalleryImage[]>(
    '/gallery-images',
    STORAGE_KEYS.GALLERY_IMAGES,
    []
  );

export const saveGalleryImage = (
  image: GalleryImage
) =>
  syncUpsert(
    '/gallery-images',
    STORAGE_KEYS.GALLERY_IMAGES,
    image
  );

export const deleteGalleryImage = (
  id: string
) =>
  syncDelete(
    '/gallery-images',
    STORAGE_KEYS.GALLERY_IMAGES,
    id
  );

export const getHomepageGallery = async () => {
  const images = await getGalleryImages();
  const safeImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'fallback-1',
            imageUrl:
              'https://picsum.photos/800/1000?grayscale',
            title: 'Gallery',
            description: 'MOCA',
          },
        ];

  const makeTrack = (
    direction: 1 | -1,
    speed: number
  ) => ({
    direction,
    speed,
    images: safeImages,
  });

  return [
    makeTrack(1, 0.05),
    makeTrack(-1, 0.03),
    makeTrack(1, 0.04),
  ];
};

/* ================================
   PRESS RELEASES
================================ */

export const getPressReleases =
  async (): Promise<PressRelease[]> =>
    syncGet(
      '/press-releases',
      STORAGE_KEYS.PRESS_RELEASES,
      []
    );

export const savePressRelease = async (
  press: PressRelease
) =>
  syncUpsert(
    '/press-releases',
    STORAGE_KEYS.PRESS_RELEASES,
    press
  );

export const deletePressRelease = async (
  id: string
) =>
  syncDelete(
    '/press-releases',
    STORAGE_KEYS.PRESS_RELEASES,
    id
  );

/* ================================
   REVIEWS
================================ */

export const getReviews = async (
  itemId: string
): Promise<Review[]> => {
  const reviews = getLocal<Review[]>(
    STORAGE_KEYS.REVIEWS,
    []
  );
  return reviews.filter((review) => review.itemId === itemId);
};

export const addReview = async (
  review: Review
): Promise<void> => {
  const reviews = getLocal<Review[]>(
    STORAGE_KEYS.REVIEWS,
    []
  );
  setLocal(STORAGE_KEYS.REVIEWS, [review, ...reviews]);
};
