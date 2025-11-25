# Cuaca ID — Modern Weather PWA

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)

> **Aplikasi web pengecek cuaca real-time untuk Indonesia**
>
> Menggunakan data BMKG (melalui API publik), antarmuka Glassmorphism yang futuristik, dan dukungan PWA sehingga bisa diinstal dan bekerja secara offline terbatas.

---

## ✨ Fitur Utama

* **Glassmorphism UI** — Tampilan transparan dengan efek blur yang modern dan responsif.
* **Data Real-time** — Mengambil data cuaca berbasis lokasi dari API publik (format data sesuai BMKG).
* **PWA (Installable)** — Mendukung manifest & service worker: dapat ditambahkan ke Home Screen dan memiliki caching untuk akses offline terbatas.
* **Smart Weather Icons** — Ikon berubah otomatis berdasarkan kondisi cuaca (cerah, berawan, hujan, dsb.).
* **Info Lengkap** — Menampilkan suhu, kelembapan, kecepatan & arah angin, jarak pandang, deskripsi cuaca.
* **Ringan & Cepat** — Dibangun dengan Vanilla JavaScript tanpa framework besar untuk performa optimal.

---

## 📁 Struktur Project

Letakkan semua file berikut di dalam folder `CuacaApp/`:

```
CuacaApp/
├── index.html        # Halaman utama (UI + logika fetch & DOM)
├── manifest.json     # Metadata PWA (nama, ikon, tema)
└── sw.js             # Service worker (caching & offline strategy)
```

> ⚠️ Karena service worker memerlukan *secure context*, buka aplikasi melalui `http://localhost` (Live Server) atau hosting HTTPS — fitur instal (PWA) TIDAK AKAN bekerja lewat `file://`.

---

## 🛠️ Prasyarat

* Node/Server *opsional* — Untuk menjalankan live server lokal (mis. VS Code + Live Server).
* Browser modern yang mendukung service worker & PWA (Chrome, Edge, Firefox, Safari pada iOS memiliki keterbatasan PWA).

---

## 🚀 Cara Menjalankan (Localhost)

1. Buka folder `CuacaApp/` di VS Code.
2. Instal ekstensi **Live Server** (jika belum).
3. Klik kanan `index.html` → **Open with Live Server**.
4. Buka `http://127.0.0.1:5500` atau alamat yang ditampilkan.

Atau gunakan server statis sederhana (mis. `npx http-server`).

---

## 🌐 Cara Deploy (Hosting HTTPS)

Anda dapat menggunakan layanan hosting statis gratis:

* GitHub Pages
* Vercel
* Netlify

Setelah ter-deploy di domain HTTPS, PWA dapat diinstall dari browser yang mendukung.

---

## 📲 Cara Install sebagai PWA

**Android (Chrome / Edge):**

* Buka situs → klik tombol *Install App* jika tersedia, atau buka menu browser → pilih *Install App*.

**iOS (Safari):**

* Buka situs → tombol *Share* → pilih *Add to Home Screen*.

> Catatan: Pada iOS, service worker dan beberapa fitur PWA masih terbatas — alur install berbeda dari Android.

---

## 🔌 API Reference

Aplikasi ini memanfaatkan API publik yang menyajikan data cuaca untuk lokasi di Indonesia.

Contoh endpoint (provider publik):

```
GET https://api.ootaizumi.web.id/lokasi/cuaca?lokasi={NAMA_KOTA}
```

> Ganti `{NAMA_KOTA}` dengan nama kota (contoh: `Jakarta`). Pastikan memeriksa dokumentasi provider API untuk rate limit dan format respons.

---

## 🧩 Implementasi Singkat

* `index.html`

  * Struktur semantic HTML untuk aksesibilitas.
  * Styling menggunakan CSS modern (Flexbox / Grid) dan efek glassmorphism (`backdrop-filter`, `box-shadow`, dsb.).
  * Logika JavaScript untuk: mengambil data API (`fetch`), memetakan icon berdasarkan kode cuaca, dan update DOM.

* `sw.js` (Service Worker)

  * Strategi caching: *Network first* untuk data dynamic (fetch terbaru), *Cache first* untuk aset statis (CSS/JS/ikon) agar pengalaman offline lebih baik.
  * Tangani `install`, `activate`, dan `fetch` event.

* `manifest.json`

  * Isi: `name`, `short_name`, `start_url`, `display` (`standalone`), `background_color`, `theme_color`, dan ikon dalam ukuran standar PWA.

---

## ✅ Contoh Potongan Kode

**Contoh fetch sederhana (index.html):**

```js
async function fetchCuaca(kota) {
  const url = `https://api.ootaizumi.web.id/lokasi/cuaca?lokasi=${encodeURIComponent(kota)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil data cuaca');
  return await res.json();
}

// pemakaian
fetchCuaca('Jakarta')
  .then(data => renderCuaca(data))
  .catch(err => showError(err.message));
```

**Contoh strategi caching sederhana (sw.js):**

```js
const CACHE_NAME = 'cuaca-v1';
const ASSETS = ['/','/index.html','/style.css','/app.js','/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // untuk permintaan API: network-first
  if (e.request.url.includes('/lokasi/cuaca')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // aset statis: cache-first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

---

## 📝 Tips & Best Practices

* Tangani izin lokasi dengan benar (jika menggunakan `navigator.geolocation`) dan fallback ke pencarian nama kota.
* Beri umpan balik UI saat loading / saat API down.
* Perhatikan batasan CORS pada provider API — gunakan proxy jika diperlukan (hati-hati terhadap keamanan).
* Ukur & optimalkan bundle: minify CSS/JS, compress gambar, gunakan `preload` untuk aset penting.

---

## 📛 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — cek file `LICENSE` pada repo untuk detail.

---

## ❤️ Credits

Dibuat oleh **itsbad** untuk tujuan pembelajaran Web Development.

API data: **Ootaizumi** (pihak ketiga)

---
