# Arsip Data PBB

Website statis untuk melihat arsip SPPT dan STTS. Aplikasi berjalan langsung di browser, tanpa Next.js, database, atau proses build.

## Fitur

- Filter tahun, kecamatan, desa, dan pencarian
- Pilihan tahun 2016–2026 diurutkan dari tahun terlama
- Ringkasan jumlah per kategori buku
- Unduh data yang sedang difilter ke Excel
- Riwayat data per tahun
- Tampilan responsif untuk desktop dan ponsel

## Menjalankan secara lokal

Buka `index.html` di browser untuk halaman SPPT, atau `stts.html` untuk halaman STTS. Untuk server lokal, jalankan:

```bash
npx serve .
```

## Memperbarui data

1. Edit `data/sppt.csv` dan/atau `data/stts.csv`. Kolom harus tetap berurutan: `tahun,kecamatan,desa,buku1,buku2,buku3,buku4,buku5`.
2. Pastikan kombinasi tahun, kecamatan, dan desa tidak duplikat; tahun harus 2000-2100; nilai buku harus bilangan bulat non-negatif.
   Rekap SPPT tanpa rincian buku disimpan terpisah di `data/sppt-tahunan-tanpa-rincian-buku.csv` dan tidak ditampilkan sebagai angka per buku.
   Data Cijeruk untuk tahun 2016–2026 ditampilkan sebagai placeholder bernilai 0, bukan angka resmi.
3. Buat ulang data browser dari folder utama proyek:

   ```bash
   node tools/buat-data.js
   ```

4. Periksa hasilnya di `index.html` dan `stts.html`.

## Deploy ke GitHub Pages

1. Pastikan branch `main` berisi `index.html` di folder utama repository.
2. Di GitHub, buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
5. Setelah publikasi selesai, situs tersedia di `https://<nama-akun>.github.io/<nama-repo>/`. Halaman STTS ada di `/stts.html`.

Tidak perlu build command atau custom domain. Pastikan repository bersifat publik jika menggunakan GitHub Pages gratis.

## Login dan panel admin

Ikon rumah di header membuka halaman login admin dengan username dan kata sandi. Di Vercel, atur `ADMIN_USERNAME`, `ADMIN_PASSWORD` (minimal 12 karakter), dan `ADMIN_SESSION_SECRET` (minimal 32 byte) pada **Project Settings → Environment Variables** untuk environment Production. Buat nilai rahasia sesi secara lokal dengan:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Jangan masukkan nilai rahasia ke repository atau bagikan di chat. Setelah variabel disimpan, redeploy proyek. Panel admin mengedit data di browser dan mengunduh CSV; perubahan tidak langsung tersimpan ke situs. Ganti CSV terkait di `data/`, jalankan `node tools/buat-data.js`, lalu commit dan push agar Vercel menerbitkan data terbaru. Login admin memerlukan Vercel Functions sehingga tidak berfungsi di GitHub Pages.

## Deploy ke Vercel

Impor repository ini di Vercel dan pilih konfigurasi **Other**. Biarkan Build Command, Output Directory, dan Install Command kosong; halaman utama tetap dilayani sebagai file statis dan endpoint login admin berjalan sebagai Vercel Functions di folder `api/`.

## Struktur utama

```text
index.html       Halaman SPPT
stts.html        Halaman STTS
css/style.css    Gaya dan tata letak
js/app.js        Filter, ringkasan, dan tabel
js/export.js     Unduh Excel
login.html       Login admin tersembunyi dari navigasi utama
admin.html       Editor admin dan unduh CSV
api/admin/       Endpoint login, sesi, dan logout
lib/admin-auth.cjs
                 Verifikasi password dan sesi admin
data/*.csv       Sumber data yang diedit
data/data.js     Data browser hasil generate
data/pemulihan-data.json
                 Snapshot JSON untuk pemulihan data
tools/buat-data.js
                 Generator data.js dari CSV
```

`data/pemulihan-data.json` berisi snapshot data aplikasi SPPT/STTS, rekap tahunan tanpa rincian buku, dan rekap gabungan sementara. Perbarui snapshot ini setelah mengubah sumber data jika diperlukan untuk pemulihan terbaru.

## Catatan data

Konten di `data/` akan tersedia untuk pengunjung situs. Jangan masukkan informasi rahasia atau data pribadi yang tidak boleh dipublikasikan. Fitur unduh Excel memuat ExcelJS dari CDN dan membutuhkan koneksi internet.
Pilihan tahun selalu menampilkan 2016–2026. Tabel hanya menampilkan tahun yang memiliki data di CSV; tahun tanpa data tidak diberi angka rekaan.
