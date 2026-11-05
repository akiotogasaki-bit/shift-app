/* 📓 手帳（boss/journal.html）を電波が無くても開けるようにする ★2026-11-05
   ・画面（html）は「まずネット、だめなら控え」＝直した版がすぐ届く
   ・書体と Firebase の部品は「まず控え」＝一度読めば電波が無くても使える
   ・関数（cloudfunctions）への送信は触らない（控えない） */
var CACHE = 'journal-v2';
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(['./journal.html', './journal.webmanifest', './cockpit-icon.png']); }).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('journal-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  var u = new URL(e.request.url);
  if(e.request.method !== 'GET' || u.hostname.indexOf('cloudfunctions.net') >= 0 || u.hostname.indexOf('googleapis.com') >= 0 && u.pathname.indexOf('/css') !== 0 && u.hostname !== 'fonts.googleapis.com') return;
  var asset = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.hostname === 'www.gstatic.com';
  if(asset){
    e.respondWith(caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(r){ var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); return r; });
    }));
    return;
  }
  if(u.origin !== self.location.origin || u.pathname.indexOf('/boss/journal') < 0 && u.pathname.indexOf('cockpit-icon') < 0) return;
  e.respondWith(fetch(e.request).then(function(r){ var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); return r; })
    .catch(function(){ return caches.match(e.request, { ignoreSearch: true }); }));
});
