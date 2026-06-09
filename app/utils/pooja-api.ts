// Client-side helpers for the Pooja / Remedy booking module.
// All calls go through the Next.js BFF routes under /api/pooja/* which forward
// auth to user-service.
import { simpleApiRequest } from './production-api';

export interface PoojaCategory {
  _id: string;
  title: string;
  slug: string;
  bannerImage?: string;
  tag?: string;
}

export interface PoojaProduct {
  _id: string;
  categoryId: string;
  title: string;
  slug: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  benefits?: string[];
  faqs?: { heading: string; body: string }[];
  thumbnail?: string;
  heroImage?: string;
  rating?: number;
  reviewCount?: number;
  startingPrice?: number;
  startingOriginalPrice?: number;
  currency?: string;
}

/** Local placeholder used while real images are dropped into /public/pooja_images. */
export const POOJA_PLACEHOLDER = '/pooja_images/placeholder.svg';

/**
 * Cache-busting token for /pooja_images. Pooja images are swapped in place
 * (same filename), so browsers/CDNs would otherwise serve a stale copy.
 * Bump this whenever you replace image files so clients re-fetch them.
 */
export const POOJA_IMG_VERSION = '20260608-1';

/** Resolve an image path (falling back to the placeholder) with a cache-busting version. */
export function poojaImg(path?: string | null): string {
  const p = path && path.trim() ? path : POOJA_PLACEHOLDER;
  if (!p.startsWith('/pooja_images/')) return p;
  return p.includes('?') ? p : `${p}?v=${POOJA_IMG_VERSION}`;
}

export interface PoojaProvider {
  providerId: string;
  name: string;
  avatar?: string;
  skills?: string[];
  languages?: string[];
  experienceYears?: number;
  rating?: number;
  orderCount?: number;
  isAvailable?: boolean;
  originalPrice: number;
  discountedPrice: number;
  currency?: string;
}

export interface PoojaQuote {
  lineItems: { productId: string; providerId: string; title: string; providerName: string; price: number }[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponApplied: boolean;
  gstRate: number;
  gstAmount: number;
  walletDeduction: number;
  totalPayable: number;
  currency: string;
}

export interface PoojaOrder {
  _id: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  lineItems: { productId: string; providerId: string; title: string; providerName: string; price: number }[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  totalPayable: number;
  currency: string;
  chatThreadId?: string | null;
  createdAt: string;
}

/**
 * Single request helper for all pooja BFF calls. Uses simpleApiRequest so every
 * call attaches the Bearer + cookies, and — critically — transparently refreshes
 * the access token on a 401 and retries (same behaviour as the wallet/payment
 * layer). This is what prevents the "Authentication failed" error once the
 * 15-minute access token expires.
 */
async function poojaApi(url: string, options: RequestInit = {}): Promise<any> {
  const res = await simpleApiRequest(url, options); // throws on non-ok (after refresh+retry)
  const data = await res.json().catch(() => ({}));
  if (data?.success === false) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

// ---- catalog (public) ----
export async function fetchCategories(): Promise<PoojaCategory[]> {
  return (await poojaApi('/api/pooja/categories')).data || [];
}

export async function fetchCategoryProducts(
  categoryId: string,
  page = 1,
  limit = 20
): Promise<{ items: PoojaProduct[]; total: number; page: number; limit: number }> {
  const data = await poojaApi(`/api/pooja/categories/${categoryId}/products?page=${page}&limit=${limit}`);
  return data.data || { items: [], total: 0, page, limit };
}

export interface FetchProductsParams {
  categoryId?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchAllProducts(
  params: FetchProductsParams = {}
): Promise<{ items: PoojaProduct[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const data = await poojaApi(`/api/pooja/products?${qs.toString()}`);
  return data.data || { items: [], total: 0, page: 1, limit: 30 };
}

export async function fetchProduct(productId: string): Promise<PoojaProduct> {
  return (await poojaApi(`/api/pooja/products/${productId}`)).data;
}

export async function fetchProviders(productId: string, sort?: string, language?: string): Promise<PoojaProvider[]> {
  const qs = new URLSearchParams();
  if (sort) qs.set('sort', sort);
  if (language) qs.set('language', language);
  return (await poojaApi(`/api/pooja/products/${productId}/providers?${qs.toString()}`)).data || [];
}

// ---- orders (auth) ----
export async function fetchQuote(lineItems: { productId: string; providerId: string }[], couponCode?: string): Promise<PoojaQuote> {
  const data = await poojaApi('/api/pooja/orders/quote', {
    method: 'POST',
    body: JSON.stringify({ lineItems, couponCode: couponCode || undefined }),
  });
  return data.data;
}

export async function createOrder(
  lineItems: { productId: string; providerId: string }[],
  idempotencyKey: string,
  couponCode?: string,
  billingState?: string
): Promise<PoojaOrder> {
  const data = await poojaApi('/api/pooja/orders', {
    method: 'POST',
    body: JSON.stringify({ lineItems, idempotencyKey, couponCode: couponCode || undefined, billingState }),
  });
  return data.data;
}

/**
 * Initiates the PhonePe payment on the backend (user-service, official
 * pg-sdk-node) and returns the hosted-checkout redirect URL. Confirmation is
 * server-authoritative — the /pooja/payment-status page polls the order, whose
 * reconcile verifies with PhonePe and marks it PAID.
 */
export async function initiatePayment(orderId: string): Promise<{ redirectUrl: string }> {
  const data = await poojaApi('/api/pooja/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
  if (!data?.data?.redirectUrl) {
    throw new Error(data?.message || 'Failed to start payment');
  }
  return { redirectUrl: data.data.redirectUrl };
}

/**
 * Settles a pooja order against the user's Sobhagya wallet balance (same wallet
 * used by calls/chat). On success the backend debits the wallet and marks the
 * order PAID, so /pooja/payment-status confirms it on the first poll.
 *
 * NOTE: requires user-service to expose POST /api/pooja/payments/wallet. If the
 * backend doesn't support wallet settlement yet, this throws and the checkout
 * UI falls back to the PhonePe-direct path.
 */
export async function payFromWallet(orderId: string): Promise<PoojaOrder> {
  const data = await poojaApi('/api/pooja/payments/wallet', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
  return data.data;
}

export async function fetchOrder(orderId: string): Promise<PoojaOrder> {
  return (await poojaApi(`/api/pooja/orders/${orderId}`)).data;
}

export async function fetchOrders(status?: string): Promise<PoojaOrder[]> {
  const qs = status ? `?status=${status}` : '';
  return (await poojaApi(`/api/pooja/orders${qs}`)).data || [];
}

// ---- remedy chat (auth) ----
export interface RemedyMessage {
  _id: string;
  threadId: string;
  senderType: 'ADMIN' | 'USER' | 'PROVIDER';
  body: string;
  attachments?: string[];
  createdAt: string;
}

export async function fetchMessages(threadId: string, cursor?: string): Promise<{ thread: any; messages: RemedyMessage[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return (await poojaApi(`/api/pooja/chats/${threadId}/messages${qs}`)).data;
}

export async function sendMessage(threadId: string, body: string): Promise<RemedyMessage> {
  const data = await poojaApi(`/api/pooja/chats/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
  return data.data;
}

export function formatINR(n: number | undefined): string {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}
