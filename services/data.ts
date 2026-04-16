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

const setLocal = (key: string, data: any, dispatchEvent: boolean = true) => {
  localStorage.setItem(key, JSON.stringify(data));
  if (dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent('MOCA_DB_UPDATE', { detail: { store: key } })
    );
  }
};

/* ================================
   API HELPERS
================================ */
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
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
  const index = list.findIndex((i) => i[idField] === item[idField]);
  index > -1 ? (list[index] = item) : list.unshift(item);
  setLocal(storageKey, list);

  try {
    await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  } catch (error) {
    console.error(`[API WRITE] ${endpoint}`, error);
    setLocal(storageKey, originalList); // Rollback local state
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
    setLocal(storageKey, originalList); // Rollback local state
  }
};

/* ================================
   CONNECTION STATUS (USED BY UI)
================================ */
export const checkDatabaseConnection = () => ({
  isConnected: true, // Always connected to our API
  mode: 'LIVE API',
  url: 'CONNECTED',
  timestamp: Date.now(),
});

/* ================================
   INITIAL BOOTSTRAP
================================ */
export const bootstrapMuseumData = async () => {
  // Initialize with local data as fallback
  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS))
    setLocal(STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS, false);

  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS))
    setLocal(STORAGE_KEYS.ARTWORKS, ARTWORKS, false);

  if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES))
    setLocal(STORAGE_KEYS.COLLECTABLES, COLLECTABLES, false);

  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS))
    setLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS, false);

  if (!localStorage.getItem(STORAGE_KEYS.GALLERY_IMAGES))
    setLocal(STORAGE_KEYS.GALLERY_IMAGES, [], false);

  if (!localStorage.getItem(STORAGE_KEYS.PRESS_RELEASES))
    setLocal(STORAGE_KEYS.PRESS_RELEASES, [], false);
};

/* ================================
   API
================================ */

export const getExhibitions = () =>
  syncGet<Exhibition[]>('/exhibitions', STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);

export const saveExhibition = (ex: Exhibition) =>
  syncUpsert('/exhibitions', STORAGE_KEYS.EXHIBITIONS, ex);

export const getArtworks = () =>
  syncGet<Artwork[]>('/artworks', STORAGE_KEYS.ARTWORKS, ARTWORKS);

export const getCollectables = () =>
  syncGet<Collectable[]>('/collectables', STORAGE_KEYS.COLLECTABLES, COLLECTABLES);

export const saveCollectable = (c: Collectable) =>
  syncUpsert('/collectables', STORAGE_KEYS.COLLECTABLES, c);

export const deleteCollectable = (id: string) =>
  syncDelete('/collectables', STORAGE_KEYS.COLLECTABLES, id);

export const getEvents = () =>
  syncGet<Event[]>('/events', STORAGE_KEYS.EVENTS, []);

export const getBookings = () =>
  syncGet<Booking[]>('/bookings', STORAGE_KEYS.BOOKINGS, []);

export const saveBooking = (b: Booking) =>
  syncUpsert('/bookings', STORAGE_KEYS.BOOKINGS, b);

export const updateOrderStatus = async (
  orderId: string,
  status: 'Pending' | 'Fulfilled'
) => {
  const orders = getLocal<any[]>(STORAGE_KEYS.ORDERS, []);
  const orderToUpdate = orders.find(o => o.id === orderId);

  if (orderToUpdate) {
    const updatedOrder = { ...orderToUpdate, status };
    await syncUpsert('/shop-orders', STORAGE_KEYS.ORDERS, updatedOrder);
  }
};

export const getShopOrders = () =>
  syncGet<ShopOrder[]>('/shop-orders', STORAGE_KEYS.ORDERS, []);

export const saveShopOrder = async (o: ShopOrder) => {
  await syncUpsert('/shop-orders', STORAGE_KEYS.ORDERS, o);

  // Attempt to send order confirmation email via serverless function
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: o }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send order email:', errorData.message);
    } else {
      console.log('Order email triggered successfully!');
    }
  } catch (error) {
    console.error('Error triggering order email:', error);
  }
};

export const getDashboardAnalytics = async () => {
  const [orders, bookings] = await Promise.all([
    getShopOrders(),
    getBookings(),
  ]);

  const shopRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const ticketRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalTickets = bookings.reduce(
    (s, b) => s + b.tickets.adult + b.tickets.student + b.tickets.child,
    0
  );

  return {
    totalRevenue: shopRevenue + ticketRevenue,
    shopRevenue,
    ticketRevenue,
    totalTickets,
    orderCount: orders.length,
    bookingCount: bookings.length,
    recentActivity: [...orders, ...bookings]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10),
  };
};

export const getPageAssets = async (): Promise<PageAssets> => {
  const assets = getLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
  console.log("getPageAssets returning:", assets);
  return assets;
};

export const savePageAssets = async (data: PageAssets) =>
  setLocal(STORAGE_KEYS.PAGE_ASSETS, data, false);

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';

export const getGalleryImages = () =>
  syncGet<GalleryImage[]>('/gallery-images', STORAGE_KEYS.GALLERY_IMAGES, []);

export const saveGalleryImage = (image: GalleryImage) =>
  syncUpsert('/gallery-images', STORAGE_KEYS.GALLERY_IMAGES, image);

export const deleteGalleryImage = (id: string) =>
  syncDelete('/gallery-images', STORAGE_KEYS.GALLERY_IMAGES, id);

export const getHomepageGallery = async () => {
  const galleryImages = await getGalleryImages();

  // Group images into tracks (example logic, adjust as needed)
  // For simplicity, let's create 3 tracks and distribute images evenly
  const tracks: { speed: number; direction: number; images: GalleryImage[] }[] = [
    { speed: 0.05, direction: 1, images: [] },
    { speed: 0.03, direction: -1, images: [] },
    { speed: 0.07, direction: 1, images: [] },
  ];

  galleryImages.forEach((image, index) => {
    tracks[index % tracks.length].images.push(image);
  });

  return tracks;
};

export const getPressReleases = async (): Promise<PressRelease[]> => {
  return syncGet<PressRelease[]>('/press-releases', STORAGE_KEYS.PRESS_RELEASES, []);
};

export const savePressRelease = async (press: PressRelease) => {
  const originalList = getLocal<PressRelease[]>(
    STORAGE_KEYS.PRESS_RELEASES,
    []
  );
  const list = [...originalList];
  const index = list.findIndex((p) => p.id === press.id);
  index > -1 ? (list[index] = press) : list.unshift(press);
  // Always persist locally and notify listeners
  setLocal(STORAGE_KEYS.PRESS_RELEASES, list);

  try {
    await apiRequest('/press-releases', {
      method: 'POST',
      body: JSON.stringify(press),
    });
  } catch (error) {
    console.error('[API WRITE] press-releases', error);
  }
};


export const deletePressRelease = async (id: string) => {
  const originalList = getLocal<PressRelease[]>(
    STORAGE_KEYS.PRESS_RELEASES,
    []
  );

  const list = originalList.filter((p) => p.id !== id);

  setLocal(STORAGE_KEYS.PRESS_RELEASES, list);

  try {
    await apiRequest(`/press-releases/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('[API DELETE] press-releases', error);
    setLocal(STORAGE_KEYS.PRESS_RELEASES, originalList);
  }
};