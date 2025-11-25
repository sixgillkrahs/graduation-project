/// <reference lib="webworker" />
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, Route, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope & typeof globalThis;
let bgSyncPlugin: BackgroundSyncPlugin | undefined;

const API_BASE = (import.meta.env.VITE_BASEURL || "").replace(/\/+$/, "");

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// cache images
const imageRoute = new Route(
  ({ request, url }) => {
    return url.origin === self.location.origin && request.destination === "image";
  },
  new CacheFirst({
    cacheName: "images",
  }),
);
registerRoute(imageRoute);

// cache api calls
const fetchPostsRoute = new Route(
  ({ request }) => {
    return request.url.startsWith(`${API_BASE}/posts`);
  },
  new NetworkFirst({
    cacheName: "api/fetch-posts",
  }),
  "GET",
);
registerRoute(fetchPostsRoute);

// cache navigations
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: "navigation",
    networkTimeoutSeconds: 3,
  }),
);
registerRoute(navigationRoute);

//  background sync
try {
  if ("sync" in self.registration) {
    bgSyncPlugin = new BackgroundSyncPlugin("backgroundSyncQueue", {
      maxRetentionTime: 24 * 60,
    });
  } else {
    console.warn("Background Sync not supported or self.registration unavailable.");
  }
} catch (e) {
  console.warn("Background Sync initialization skipped:", e);
}

const postSubmitRoute = new Route(
  ({ request }) => {
    return request.url.startsWith(`${API_BASE}/posts`);
  },
  new NetworkOnly({
    plugins: bgSyncPlugin ? [bgSyncPlugin] : [],
  }),
  "POST",
);
registerRoute(postSubmitRoute);

const postUpdateRoute = new Route(
  ({ request }) => {
    return request.url.startsWith(`${API_BASE}/posts`);
  },
  new NetworkOnly({
    plugins: bgSyncPlugin ? [bgSyncPlugin] : [],
  }),
  "PUT",
);
registerRoute(postUpdateRoute);

const postDeleteRoute = new Route(
  ({ request }) => {
    return request.url.startsWith(`${API_BASE}/posts`);
  },
  new NetworkOnly({
    plugins: bgSyncPlugin ? [bgSyncPlugin] : [],
  }),
  "DELETE",
);
registerRoute(postDeleteRoute);
