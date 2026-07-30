/**
 * ШКОЛА «СИЛКРОАД» — ПРИЁМНАЯ — service worker (Этапы 2–3)
 * Версия: К1.2 (доработка 2) • 30.07.2026.
 * Кэширует оболочку приложения: PWA запускается и без сети
 * (офлайн-очередь семей живёт в IndexedDB, см. app.js).
 * При обновлении приложения поднять номер КЭШ — старый кэш будет удалён.
 */
'use strict';

const КЭШ = 'школа-приёмная-v6';
const ОБОЛОЧКА = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (событие) {
  событие.waitUntil(
    caches.open(КЭШ).then(function (кэш) { return кэш.addAll(ОБОЛОЧКА); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (событие) {
  событие.waitUntil(
    caches.keys().then(function (имена) {
      return Promise.all(имена.map(function (имя) {
        if (имя !== КЭШ) return caches.delete(имя);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (событие) {
  const запрос = событие.request;
  // POST к серверу Apps Script и прочие чужие адреса не трогаем — только оболочка
  if (запрос.method !== 'GET' || !запрос.url.startsWith(self.location.origin)) return;
  событие.respondWith(
    caches.match(запрос, { ignoreSearch: true }).then(function (изКэша) {
      return изКэша || fetch(запрос);
    })
  );
});
