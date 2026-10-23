# Arsip Data SPPT (PBB) - Website Statis

Website statis untuk menampilkan arsip data SPPT dan STTS (PBB) dari tiga kecamatan.

## 📋 Fitur

- ✅ Tampilan data SPPT dan STTS per tahun, kecamatan, dan desa
- ✅ Filter interaktif (Tahun, Kecamatan, Desa, Pencarian)
- ✅ Kartu ringkasan untuk 5 kategori Buku + Total
- ✅ Export data ke Excel (.xlsx)
- ✅ Tabel riwayat per tahun
- ✅ Responsive untuk desktop dan mobile
- ✅ Tema hijau zamrud yang rapi dan profesional
- ✅ Tidak memerlukan database atau server

## 🚀 Cara Menjalankan di Komputer

### Metode 1: Buka Langsung
1. Klik dua kali file **index.html**
2. Website akan terbuka di browser default Anda

### Metode 2: Dengan Server Lokal (Opsional)
Jika ingin menggunakan server lokal:
`ash
npx serve
`
Lalu buka http://localhost:3000

## 📝 Cara Memperbarui Data

Data arsip disimpan dalam file CSV yang bisa diedit dengan Excel atau editor teks.

### Langkah-langkah:

1. **Edit file CSV**
   - Buka **data/sppt.csv** untuk data SPPT
   - Buka **data/stts.csv** untuk data STTS
   - Edit dengan Excel atau editor teks
   - Pastikan format tetap: 	ahun,kecamatan,desa,buku1,buku2,buku3,buku4,buku5

2. **Generate ulang data.js**
   `ash
   node tools/buat-data.js
   `
   Script ini akan:
   - Membaca data dari CSV
   - Validasi data (cek duplikat, format angka)
   - Generate file data/data.js

3. **Cek hasilnya**
   - Buka **index.html** di browser
   - Periksa data sudah terupdate

### Contoh Edit CSV:
`csv
tahun,kecamatan,desa,buku1,buku2,buku3,buku4,buku5
2026,Caringin,Caringin,150,120,80,40,10
2026,Caringin,Ciderum,180,140,90,50,15
`

**⚠️ Penting:**
- Jangan ada baris duplikat (kombinasi tahun+kecamatan+desa harus unik)
- Tahun harus angka bulat (2000-2100)
- Buku1-5 harus angka bulat non-negatif
- Simpan CSV dengan encoding UTF-8

## 🌐 Deploy ke Vercel

### Persiapan:
1. Pastikan kode sudah di Git/GitHub:
   `ash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <URL-REPO-ANDA>
   git push -u origin main
   `

### Deploy:
1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub
3. Klik **Add New → Project**
4. Pilih repository Anda
5. **Penting:** Atur konfigurasi:
   - **Framework Preset:** Other
   - **Build Command:** (kosongkan)
   - **Output Directory:** (kosongkan)
   - **Install Command:** (kosongkan)
6. Klik **Deploy**

### Update Website:
Setiap kali Anda git push, website otomatis terupdate di Vercel.

`ash
# Setelah edit data dan generate ulang
git add data/
git commit -m "Update data arsip"
git push
`

## 📁 Struktur File

`
├── index.html          # Halaman SPPT
├── stts.html           # Halaman STTS
├── css/
│   └── style.css       # Stylesheet
├── js/
│   ├── app.js          # Logika aplikasi
│   └── export.js       # Export Excel
├── data/
│   ├── data.js         # Data utama (auto-generated)
│   ├── sppt.csv        # Data SPPT (edit ini)
│   └── stts.csv        # Data STTS (edit ini)
├── tools/
│   └── buat-data.js    # Script generator
├── vercel.json         # Config Vercel
└── README.md           # Dokumentasi ini
`

## 🎨 Tema Warna

- **Hijau Utama:** #047857 (emerald-700)
- **Hijau Tua (Judul):** #064e3b (emerald-900)
- **Hijau Hover:** #059669 (emerald-600)
- **Background:** #f9fafb (gray-50)
- **Border:** #e5e7eb (gray-200)
- **Text:** #374151 (gray-700)

## 📊 Kategori Buku

- **Buku 1:** Kurang dari Rp 100.000
- **Buku 2:** Rp 100.000 - Rp 500.000
- **Buku 3:** Rp 500.000 - Rp 2.000.000
- **Buku 4:** Rp 2.000.000 - Rp 5.000.000
- **Buku 5:** Di atas Rp 5.000.000

## 🔒 Keamanan & Privacy

⚠️ **PENTING:**
- Website ini **PUBLIK** - siapa saja dengan link bisa mengakses
- Jangan masukkan data rahasia atau sensitif
- Jika data tidak untuk publik:
  - Gunakan repository **Private** di GitHub
  - Pertimbangkan proteksi akses di Vercel (berbayar)

## 🛠️ Troubleshooting

### Data tidak muncul
- Cek console browser (F12) untuk error
- Pastikan file data/data.js ada dan valid
- Coba refresh browser (Ctrl+F5)

### Export Excel tidak bekerja
- Periksa koneksi internet (butuh load ExcelJS dari CDN)
- Cek console untuk error

### Script buat-data.js error
- Pastikan Node.js terinstall
- Cek format CSV (harus UTF-8, format sesuai)
- Lihat pesan error untuk detail masalah

## 📦 Dependencies

- **ExcelJS 4.4.0** (loaded dari CDN)
- Tidak ada npm package yang perlu diinstall untuk menjalankan website
- Node.js hanya diperlukan untuk script 	ools/buat-data.js

## 📄 Lisensi

Silakan digunakan dan dimodifikasi sesuai kebutuhan.

---

**Dibuat dengan:** HTML, CSS, JavaScript (Vanilla)  
**Deploy:** Vercel  
**Update Terakhir:** 2024
