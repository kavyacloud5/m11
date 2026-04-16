import {
  Collectable,
  Exhibition,
  Artwork,
  Event,
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
const API_BASE = '/api/data';

/* ================================
   LOCAL STORAGE KEYS
================================ */
const STORAGE_KEYS = {
  COLLECTABLES: 'MOCA_COLLECTABLES',
  EXHIBITIONS: 'MOCA_EXHIBITIONS',
  ARTWORKS: 'MOCA_ARTWORKS',
  EVENTS: 'MOCA_EVENTS',
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
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.statusText}`
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
export const checkDatabaseConnection = () => ({
  isConnected: true,
  mode: 'LIVE API',
  url: 'CONNECTED',
  timestamp: Date.now(),
});

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

export const getEvents = () =>
  syncGet<Event[]>(
    '/events',
    STORAGE_KEYS.EVENTS,
    []
  );

export const getPageAssets = () =>
  syncGet<PageAssets>(
    '/page-assets',
    STORAGE_KEYS.PAGE_ASSETS,
    DEFAULT_ASSETS
  );

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

export const updateOrderStatus = async (
  id: string,
  status: ShopOrder['status']
) => {
  const originalList = getLocal<ShopOrder[]>(
    STORAGE_KEYS.ORDERS,
    []
  );

  const nextList = originalList.map((order) =>
    order.id === id ? { ...order, status } : order
  );
  setLocal(STORAGE_KEYS.ORDERS, nextList);

  try {
    await apiRequest(`/shop-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('[API PATCH] /shop-orders', error);
    setLocal(STORAGE_KEYS.ORDERS, originalList);
  }
};

export const getDashboardAnalytics = async () => {
  const [orders, bookings] = await Promise.all([
    getShopOrders(),
    getBookings(),
  ]);

  const orderRevenue = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const bookingRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0
  );
  const totalTickets = bookings.reduce(
    (sum, booking) =>
      sum +
      (booking.tickets?.adult || 0) +
      (booking.tickets?.student || 0) +
      (booking.tickets?.child || 0),
    0
  );
  const recentActivity = [...orders, ...bookings]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return {
    totalRevenue: orderRevenue + bookingRevenue,
    totalTickets,
    orderCount: orders.length,
    recentActivity,
  };
};

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';

/* ================================
   GALLERY
================================ */

export const getGalleryImages = () =>
  syncGet<GalleryImage[]>(
    '/gallery-images',
    STORAGE_KEYS.GALLERY_IMAGES,
    []
  );

export const getHomepageGallery = async () => {
  const savedImages = await getGalleryImages();
  const fallbackImages: GalleryImage[] = [
    ...EXHIBITIONS.map((item) => ({
      id: `hx-${item.id}`,
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description,
    })),
    ...ARTWORKS.map((item) => ({
      id: `ha-${item.id}`,
      imageUrl: item.imageUrl,
      title: item.title,
      description: `${item.artist} • ${item.year}`,
    })),
  ];

  const images =
    savedImages.length > 0
      ? savedImages
      : fallbackImages.slice(0, 8);

  return [
    { speed: 0.08, direction: 1, images },
    {
      speed: 0.12,
      direction: -1,
      images: [...images].reverse(),
    },
  ];
};

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

export const getReviews = async (
  itemId: string
): Promise<Review[]> => {
  const reviews = getLocal<Review[]>(
    STORAGE_KEYS.REVIEWS,
    []
  );

  return reviews
    .filter((review) => review.itemId === itemId)
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const addReview = async (review: Review) => {
  const originalReviews = getLocal<Review[]>(
    STORAGE_KEYS.REVIEWS,
    []
  );
  const nextReviews = [review, ...originalReviews];
  setLocal(STORAGE_KEYS.REVIEWS, nextReviews);

  try {
    await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  } catch (error) {
    console.error('[API WRITE] /reviews', error);
    setLocal(STORAGE_KEYS.REVIEWS, originalReviews);
  }
};
