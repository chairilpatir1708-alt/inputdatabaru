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
3. Buat ulang data browser:

   ```bash
   npm run data:generate
   ```

   Atau tanpa npm:

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

## Deploy ke Vercel

Impor repository ini di Vercel dan pilih konfigurasi **Other**. Biarkan Build Command, Output Directory, dan Install Command kosong; situs dilayani sebagai file statis dari folder utama. Tidak ada variabel lingkungan atau database yang diperlukan.

## Struktur utama

```text
index.html       Halaman SPPT
stts.html        Halaman STTS
css/style.css    Gaya dan tata letak
js/app.js        Filter, ringkasan, dan tabel
js/export.js     Unduh Excel
data/*.csv       Sumber data yang diedit
data/data.js     Data browser hasil generate
tools/buat-data.js
                 Generator data.js dari CSV
```

## Catatan data

Konten di `data/` akan tersedia untuk pengunjung situs. Jangan masukkan informasi rahasia atau data pribadi yang tidak boleh dipublikasikan. Fitur unduh Excel memuat ExcelJS dari CDN dan membutuhkan koneksi internet.
Pilihan tahun selalu menampilkan 2016–2026. Tabel hanya menampilkan tahun yang memiliki data di CSV; tahun tanpa data tidak diberi angka rekaan.
