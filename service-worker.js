// ==========================================
// BD Assistant
// Service Worker
// Version 1.01
// ==========================================

self.addEventListener("install", (event) => {
    console.log("Service Worker installé");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activé");
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
    // Le cache sera ajouté plus tard.
});