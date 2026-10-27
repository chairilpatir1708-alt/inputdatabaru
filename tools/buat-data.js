// tools/buat-data.js - Script untuk generate data/data.js dari CSV
// Cara pakai: node tools/buat-data.js

const fs = require('fs');
const path = require('path');

const CSV_SPPT = path.join(__dirname, '..', 'data', 'sppt.csv');
const CSV_STTS = path.join(__dirname, '..', 'data', 'stts.csv');
const OUTPUT = path.join(__dirname, '..', 'data', 'data.js');

// Parse CSV
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) {
      console.error(`Baris ${i + 1}: Jumlah kolom tidak sesuai`);
      continue;
    }
    
    const row = {};
    headers.forEach((header, idx) => {
      const value = values[idx].trim();
      
      if (header === 'tahun' || header.startsWith('buku')) {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          console.error(`Baris ${i + 1}: ${header} harus angka (${value})`);
          return null;
        }
        if (header.startsWith('buku') && num < 0) {
          console.error(`Baris ${i + 1}: ${header} tidak boleh negatif`);
          return null;
        }
        row[header] = num;
      } else {
        row[header] = value;
      }
    });
    
    if (Object.keys(row).length === headers.length) {
      data.push(row);
    }
  }
  
  return data;
}

// Cek duplikat
function checkDuplicates(data, jenis) {
  const seen = new Set();
  const duplicates = [];
  
  data.forEach((row, idx) => {
    const key = `${row.tahun}|${row.kecamatan}|${row.desa}`;
    if (seen.has(key)) {
      duplicates.push({ baris: idx + 2, key });
    }
    seen.add(key);
  });
  
  if (duplicates.length > 0) {
    console.error(`\nDitemukan data duplikat di ${jenis}:`);
    duplicates.forEach(d => {
      console.error(`  Baris ${d.baris}: ${d.key.replace(/\|/g, ' - ')}`);
    });
    return false;
  }
  
  return true;
}

// Extract wilayah dari data
function extractWilayah(spptData, sttsData) {
  const wilayahMap = {};
  
  [...spptData, ...sttsData].forEach(row => {
    if (!wilayahMap[row.kecamatan]) {
      wilayahMap[row.kecamatan] = new Set();
    }
    wilayahMap[row.kecamatan].add(row.desa);
  });
  
  // Sort kecamatan dan desa
  const wilayah = Object.keys(wilayahMap).sort().map(kecamatan => ({
    kecamatan,
    desa: Array.from(wilayahMap[kecamatan]).sort()
  }));
  
  return wilayah;
}

// Main
try {
  console.log('Membaca file CSV...');
  
  if (!fs.existsSync(CSV_SPPT)) {
    console.error(`File tidak ditemukan: ${CSV_SPPT}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(CSV_STTS)) {
    console.error(`File tidak ditemukan: ${CSV_STTS}`);
    process.exit(1);
  }
  
  const spptContent = fs.readFileSync(CSV_SPPT, 'utf8');
  const sttsContent = fs.readFileSync(CSV_STTS, 'utf8');
  
  console.log('Parsing data SPPT...');
  const spptData = parseCSV(spptContent);
  console.log(`  ${spptData.length} baris data SPPT`);
  
  console.log('Parsing data STTS...');
  const sttsData = parseCSV(sttsContent);
  console.log(`  ${sttsData.length} baris data STTS`);
  
  console.log('\nValidasi data...');
  if (!checkDuplicates(spptData, 'SPPT') || !checkDuplicates(sttsData, 'STTS')) {
    console.error('\n❌ Validasi gagal. File data.js tidak diperbarui.');
    process.exit(1);
  }
  
  console.log('Ekstrak wilayah...');
  const wilayah = extractWilayah(spptData, sttsData);
  console.log(`  ${wilayah.length} kecamatan ditemukan`);
  
  console.log('\nMembuat data.js...');
  const output = `// data/data.js - Data utama arsip SPPT dan STTS
// File ini di-generate otomatis oleh tools/buat-data.js
// Jangan edit manual, edit file CSV lalu jalankan: node tools/buat-data.js

window.ARSIP_DATA = ${JSON.stringify({ wilayah, sppt: spptData, stts: sttsData }, null, 2)};
`;
  
  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`✓ File data.js berhasil dibuat: ${OUTPUT}`);
  console.log(`\nRingkasan:`);
  console.log(`  - ${wilayah.length} kecamatan`);
  console.log(`  - ${wilayah.reduce((sum, w) => sum + w.desa.length, 0)} desa`);
  console.log(`  - ${spptData.length} record SPPT`);
  console.log(`  - ${sttsData.length} record STTS`);
  console.log(`\n✅ Selesai! Buka index.html untuk melihat hasilnya.`);
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
