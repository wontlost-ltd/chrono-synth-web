/**
 * Service Worker — PWA 离线支持
 * 由 vite-plugin-pwa (Workbox) 注入 precache manifest
 * 策略：app shell 预缓存 + API 请求走 network-first（排除 auth/billing）
 */

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

/* Workbox 预缓存（vite-plugin-pwa 在构建时注入 manifest） */
precacheAndRoute(self.__WB_MANIFEST);

/* 认证/计费请求不缓存 */
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/auth') || url.pathname.startsWith('/api/v1/billing'),
  new NetworkOnly(),
);

/* API GET 请求：网络优先，回退到缓存 */
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  }),
);

/* 静态资源（JS/CSS/图片）：缓存优先 */
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);
