'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'arsip-data-sppt-override-v1';
const BOOK_FIELDS = ['buku1', 'buku2', 'buku3', 'buku4', 'buku5'];
const BASE_YEARS = Array.from({ length: 11 }, (_, index) => 2016 + index);

function validCount(value, label) {
    if (value === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0) {
        throw new Error(`${label} harus bilangan bulat nol atau lebih.`);
    }
    return Number(value);
}

function createCsv(records) {
    const headers = ['tahun', 'kecamatan', 'desa', ...BOOK_FIELDS];
    const escape = value => {
        const text = String(value);
        return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [headers, ...records.map(record => headers.map(field => record[field]))]
        .map(row => row.map(escape).join(','))
        .join('\r\n');
}

export default function AdminEditor({ data }) {
    const [records, setRecords] = useState(data.sppt.map(item => ({ ...item })));
    const [loaded, setLoaded] = useState(false);
    const [status, setStatus] = useState('');
    const [newRecord, setNewRecord] = useState({
        tahun: String(Math.max(...data.sppt.map(item => Number(item.tahun)), 2026)),
        kecamatan: data.wilayah[0]?.kecamatan || '',
        desa: '',
        buku1: '0',
        buku2: '0',
        buku3: '0',
        buku4: '0',
        buku5: '0'
    });
    const years = [...new Set([...BASE_YEARS, ...records.map(item => Number(item.tahun))])].sort((a, b) => a - b);
    const district = data.wilayah.find(item => item.kecamatan === newRecord.kecamatan);

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const override = JSON.parse(saved);
                if (!Array.isArray(override.sppt)) throw new Error('Format perubahan SPPT lokal tidak valid.');
                setRecords(override.sppt);
            } catch (error) {
                console.error('Tidak dapat membaca data admin lokal:', error);
                setStatus('Data admin lokal tidak bisa dibaca. Hapus data situs untuk memulai ulang.');
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (district && !district.desa.includes(newRecord.desa)) {
            setNewRecord(current => ({ ...current, desa: district.desa[0] || '' }));
        }
    }, [district, newRecord.desa]);

    function persist(nextRecords, message) {
        const seen = new Set();
        nextRecords.forEach(item => {
            const key = `${item.tahun}|${item.kecamatan}|${item.desa}`;
            if (seen.has(key)) throw new Error(`Data duplikat: ${item.tahun}, ${item.kecamatan}, ${item.desa}.`);
            seen.add(key);
        });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sppt: nextRecords }));
        setRecords(nextRecords);
        setStatus(message);
    }

    function changeBook(index, field, value) {
        setRecords(current => current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, [field]: value } : item
        ));
    }

    function saveChanges() {
        try {
            const validated = records.map((item, index) => ({
                tahun: validCount(String(item.tahun), `Tahun baris ${index + 1}`),
                kecamatan: item.kecamatan,
                desa: item.desa,
                ...Object.fromEntries(BOOK_FIELDS.map(field => [
                    field,
                    validCount(String(item[field]), `${field} ${item.desa} ${item.tahun}`)
                ]))
            }));
            persist(validated, 'Perubahan tersimpan di browser ini. Unduh CSV untuk menerbitkannya.');
        } catch (error) {
            setStatus(error.message);
        }
    }

    function addRecord(event) {
        event.preventDefault();
        try {
            const record = {
                tahun: validCount(newRecord.tahun, 'Tahun'),
                kecamatan: newRecord.kecamatan,
                desa: newRecord.desa,
                ...Object.fromEntries(BOOK_FIELDS.map(field => [
                    field,
                    validCount(newRecord[field], field)
                ]))
            };
            persist([...records, record], 'Data baru tersimpan di browser ini.');
            setNewRecord(current => ({
                ...current,
                desa: district?.desa[0] || '',
                buku1: '0',
                buku2: '0',
                buku3: '0',
                buku4: '0',
                buku5: '0'
            }));
        } catch (error) {
            setStatus(error.message);
        }
    }

    function downloadCsv() {
        try {
            const validated = records.map(item => ({
                ...item,
                tahun: validCount(String(item.tahun), `Tahun ${item.desa}`),
                ...Object.fromEntries(BOOK_FIELDS.map(field => [
                    field,
                    validCount(String(item[field]), `${field} ${item.desa} ${item.tahun}`)
                ]))
            }));
            const blob = new Blob(['\uFEFF', createCsv(validated)], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sppt.csv';
            link.click();
            URL.revokeObjectURL(url);
            setStatus('CSV berhasil diunduh. Ganti data/sppt.csv dan jalankan npm run data:generate.');
        } catch (error) {
            setStatus(error.message);
        }
    }

    function updateNewRecord(field, value) {
        setNewRecord(current => ({ ...current, [field]: value }));
    }

    return (
        <div className="container admin-content">
            <header className="page-header admin-page-header">
                <div className="heading-copy">
                    <p className="eyebrow">PENGELOLAAN DATA</p>
                    <h1>Admin Data SPPT</h1>
                    <p className="header-description">Ubah jumlah SPPT per desa dan kategori buku.</p>
                </div>
            </header>
            <main className="admin-main">
                <section className="admin-notice">
                    <strong>Perubahan tersimpan lokal:</strong> halaman admin dilindungi login, tetapi data SPPT tetap tersimpan pada browser ini dan belum mengubah data untuk pengunjung lain. Unduh CSV untuk menerbitkan perubahan ke situs.
                    <p><strong>Data Cijeruk:</strong> angka SPPT Buku 1–5 dan jumlah STTS tahun 2016–2026 saat ini masih placeholder 0. Ganti dengan angka resmi saat tersedia.</p>
                </section>
                <section className="data-section">
                    <div className="section-heading admin-heading">
                        <div><h2>Tambah data SPPT</h2><p className="section-description">Tambahkan catatan untuk tahun dan desa yang belum tercatat.</p></div>
                    </div>
                    <form className="admin-form" onSubmit={addRecord}>
                        <label>Tahun<select value={newRecord.tahun} onChange={event => updateNewRecord('tahun', event.target.value)} required>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select></label>
                        <label>Kecamatan<select value={newRecord.kecamatan} onChange={event => {
                            const nextDistrict = data.wilayah.find(item => item.kecamatan === event.target.value);
                            setNewRecord(current => ({ ...current, kecamatan: event.target.value, desa: nextDistrict?.desa[0] || '' }));
                        }} required>
                            {data.wilayah.map(item => <option key={item.kecamatan} value={item.kecamatan}>{item.kecamatan}</option>)}
                        </select></label>
                        <label>Desa<select value={newRecord.desa} onChange={event => updateNewRecord('desa', event.target.value)} required>
                            {district?.desa.map(item => <option key={item} value={item}>{item}</option>)}
                        </select></label>
                        {BOOK_FIELDS.map((field, index) => <label key={field}>Buku {index + 1}<input type="number" min="0" step="1" value={newRecord[field]} onChange={event => updateNewRecord(field, event.target.value)} required /></label>)}
                        <button className="btn-export" type="submit" disabled={!loaded}>Tambah data</button>
                    </form>
                </section>
                <section className="data-section">
                    <div className="section-heading admin-heading">
                        <div><h2>Edit data SPPT</h2><p className="section-description">Ubah angka buku, lalu simpan perubahan.</p></div>
                        <div className="export-section">
                            <button className="btn-export" type="button" onClick={saveChanges} disabled={!loaded}>Simpan perubahan</button>
                            <button className="btn-reset" type="button" onClick={downloadCsv}>Unduh CSV</button>
                        </div>
                    </div>
                    <p className="export-status" role="status" aria-live="polite">{status}</p>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead><tr><th>Tahun</th><th>Kecamatan</th><th>Desa</th>{BOOK_FIELDS.map((field, index) => <th key={field}>Buku {index + 1}</th>)}</tr></thead>
                            <tbody>
                                {records.map((record, index) => <tr key={`${record.tahun}-${record.kecamatan}-${record.desa}`}>
                                    <td>{record.tahun}</td><td>{record.kecamatan}</td><td>{record.desa}</td>
                                    {BOOK_FIELDS.map(field => <td key={field}><input
                                        type="number" min="0" step="1" aria-label={`${field} ${record.desa} ${record.tahun}`}
                                        value={record[field]}
                                        onChange={event => changeBook(index, field, event.target.value)}
                                    /></td>)}
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
