# Arsip Data PBB

Aplikasi Next.js untuk melihat arsip SPPT dan STTS PBB.

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Next.js. Halaman tersedia di `/` (SPPT), `/stts` (STTS), `/login` (login admin), dan `/admin` (admin SPPT yang dilindungi login dan tidak ditautkan dari navigasi publik).

## Login admin

Salin `.env.example` menjadi `.env.local` (PowerShell: `Copy-Item .env.example .env.local`), lalu isi `ADMIN_PASSWORD` dengan kata sandi unik minimal 12 karakter dan `ADMIN_SESSION_SECRET` dengan rahasia acak minimal 32 byte. Buat rahasia sesi dengan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Jangan commit `.env.local` atau membagikan nilainya. Atur kedua environment variable yang sama pada pengaturan deployment. Sesi login disimpan dalam cookie HttpOnly, SameSite=Strict, dan berlaku 8 jam. Logout tersedia di halaman admin.

## Mengelola data

- SPPT: edit `data/sppt.csv` dengan kolom `tahun,kecamatan,desa,buku1,buku2,buku3,buku4,buku5`.
- STTS: edit `data/stts.csv` dengan kolom `tahun,kecamatan,desa,jumlah`. STTS menampilkan jumlah tahunan per wilayah, tanpa kategori buku.
- Pastikan kombinasi tahun, kecamatan, dan desa unik serta nilai hitung bilangan bulat non-negatif.
- Data Cijeruk untuk semua desa tahun 2016–2026 saat ini bernilai 0 sebagai placeholder, bukan angka resmi. Ganti nilai di kedua CSV dengan data resmi saat tersedia.
- Buat ulang data Next.js setelah mengubah CSV:

  ```bash
  npm run data:generate
  ```

  Generator menulis `data/arsip-data.json`, yang dipakai aplikasi.

Halaman admin memerlukan login server-side. Perubahan data SPPT tetap tersimpan di penyimpanan lokal browser dan tidak memperbarui pengunjung lain secara otomatis. Untuk menerbitkan perubahan, unduh `sppt.csv` di halaman admin, ganti `data/sppt.csv`, jalankan generator, lalu build/deploy ulang.

## Build dan deploy

```bash
npm run build
```

Autentikasi memerlukan server Next.js yang berjalan, sehingga aplikasi ini tidak dapat menggunakan ekspor statis atau GitHub Pages. Deploy ke Vercel atau server Node.js dan atur environment variable login di pengaturan hosting.

## Struktur

```text
app/                 Rute Next.js: SPPT, STTS, dan admin
components/          Dashboard dan editor admin
css/style.css        Gaya aplikasi
data/*.csv           Sumber data
data/arsip-data.json Data hasil generate untuk Next.js
tools/buat-data.js   Generator JSON dari CSV
```

Data dalam `data/` dipublikasikan bersama situs. Jangan masukkan informasi rahasia atau data pribadi yang tidak boleh dibagikan.
