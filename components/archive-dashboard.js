'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'arsip-data-sppt-override-v1';
const BOOK_FIELDS = ['buku1', 'buku2', 'buku3', 'buku4', 'buku5'];
const NUMBER_FORMAT = new Intl.NumberFormat('id-ID');

function getLatestYear(data) {
    return data.reduce((latest, item) => Math.max(latest, Number(item.tahun) || 0), 0);
}

function getTotal(item) {
    if (Number.isFinite(item.jumlah)) return item.jumlah;
    return BOOK_FIELDS.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
}

function getWilayahIndex(wilayah, kecamatan, desa) {
    let index = 0;
    for (const item of wilayah) {
        if (item.kecamatan === kecamatan) {
            const desaIndex = item.desa.indexOf(desa);
            return index + (desaIndex >= 0 ? desaIndex : 0);
        }
        index += item.desa.length;
    }
    return index;
}

export default function ArchiveDashboard({ jenis, data }) {
    const isStts = jenis === 'stts';
    const [spptRecords, setSpptRecords] = useState(data.sppt);
    const records = isStts ? data.stts : spptRecords;
    const latestYear = getLatestYear(records);
    const [tahun, setTahun] = useState(String(latestYear || ''));
    const [kecamatan, setKecamatan] = useState('');
    const [desa, setDesa] = useState('');
    const [cari, setCari] = useState('');
    const [exportStatus, setExportStatus] = useState('');
    const skipUrlWrite = useRef(true);

    useEffect(() => {
        if (isStts) return;
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
            const override = JSON.parse(saved);
            if (!Array.isArray(override.sppt)) {
                throw new Error('Format data SPPT lokal tidak valid.');
            }
            setSpptRecords(override.sppt);
        } catch (error) {
            console.error('Tidak dapat membaca perubahan SPPT lokal:', error);
            setExportStatus('Perubahan SPPT lokal tidak valid. Periksa halaman admin.');
        }
    }, [isStts]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('tahun')) setTahun(params.get('tahun') || '');
        if (params.has('kecamatan')) setKecamatan(params.get('kecamatan') || '');
        if (params.has('desa')) setDesa(params.get('desa') || '');
        if (params.has('q')) setCari(params.get('q') || '');
    }, []);

    const years = useMemo(() => {
        const set = new Set(Array.from({ length: 11 }, (_, index) => 2016 + index));
        records.forEach(item => set.add(Number(item.tahun)));
        return [...set].sort((a, b) => a - b);
    }, [records]);

    const filteredData = useMemo(() => records
        .filter(item => {
            if (tahun && String(item.tahun) !== tahun) return false;
            if (kecamatan && item.kecamatan !== kecamatan) return false;
            if (desa && item.desa !== desa) return false;
            if (cari) {
                const query = cari.toLocaleLowerCase('id');
                if (!item.kecamatan.toLocaleLowerCase('id').includes(query) &&
                    !item.desa.toLocaleLowerCase('id').includes(query)) return false;
            }
            return true;
        })
        .sort((a, b) => getWilayahIndex(data.wilayah, a.kecamatan, a.desa) -
            getWilayahIndex(data.wilayah, b.kecamatan, b.desa)), [records, tahun, kecamatan, desa, cari, data.wilayah]);

    useEffect(() => {
        if (skipUrlWrite.current) {
            skipUrlWrite.current = false;
            return;
        }
        const params = new URLSearchParams();
        if (tahun) params.set('tahun', tahun);
        if (kecamatan) params.set('kecamatan', kecamatan);
        if (desa) params.set('desa', desa);
        if (cari) params.set('q', cari);
        const query = params.toString();
        window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }, [tahun, kecamatan, desa, cari]);

    const district = data.wilayah.find(item => item.kecamatan === kecamatan);
    const tableRows = useMemo(() => {
        if (!district) return filteredData;
        const search = cari.toLocaleLowerCase('id');
        const visibleVillages = district.desa.filter(item =>
            (!desa || item === desa) &&
            (!search || district.kecamatan.toLocaleLowerCase('id').includes(search) ||
                item.toLocaleLowerCase('id').includes(search))
        );
        const villagesWithData = new Set(filteredData.map(item => item.desa));
        return [
            ...filteredData,
            ...visibleVillages
                .filter(item => !villagesWithData.has(item))
                .map(item => ({ kecamatan, desa: item, dataUnavailable: true }))
        ].sort((a, b) => getWilayahIndex(data.wilayah, a.kecamatan, a.desa) -
            getWilayahIndex(data.wilayah, b.kecamatan, b.desa));
    }, [district, filteredData, data.wilayah, desa, cari, kecamatan]);

    const totals = useMemo(() => {
        const result = { total: 0, ...Object.fromEntries(BOOK_FIELDS.map(field => [field, 0])) };
        filteredData.forEach(item => {
            if (!isStts) BOOK_FIELDS.forEach(field => { result[field] += Number(item[field]) || 0; });
            result.total += getTotal(item);
        });
        return result;
    }, [filteredData, isStts]);

    const history = useMemo(() => {
        const matchingRecords = kecamatan ? records.filter(item => item.kecamatan === kecamatan) : records;
        const byYear = new Map();
        matchingRecords.forEach(item => {
            if (!byYear.has(item.tahun)) {
                byYear.set(item.tahun, { total: 0, ...Object.fromEntries(BOOK_FIELDS.map(field => [field, 0])) });
            }
            const year = byYear.get(item.tahun);
            year.total += getTotal(item);
            if (!isStts) BOOK_FIELDS.forEach(field => { year[field] += Number(item[field]) || 0; });
        });
        return [...byYear.entries()].sort((a, b) => a[0] - b[0]);
    }, [records, kecamatan, isStts]);

    function resetFilters() {
        setTahun(String(getLatestYear(records) || ''));
        setKecamatan('');
        setDesa('');
        setCari('');
    }

    async function exportExcel() {
        if (!filteredData.length) {
            setExportStatus('Tidak ada data untuk di-export.');
            return;
        }

        setExportStatus('Membuat file Excel...');
        try {
            const excelModule = await import('exceljs');
            const ExcelJS = excelModule.default || excelModule;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`Arsip ${jenis.toUpperCase()} ${tahun}`);
            worksheet.columns = isStts
                ? [
                    { header: 'Kecamatan', key: 'kecamatan', width: 20 },
                    { header: 'Desa', key: 'desa', width: 25 },
                    { header: 'Jumlah STTS', key: 'jumlah', width: 18 }
                ]
                : [
                    { header: 'Kecamatan', key: 'kecamatan', width: 20 },
                    { header: 'Desa', key: 'desa', width: 25 },
                    ...BOOK_FIELDS.map((field, index) => ({ header: `Buku ${index + 1}`, key: field, width: 12 })),
                    { header: 'Total', key: 'total', width: 15 }
                ];
            worksheet.getRow(1).font = { bold: true };

            filteredData.forEach(item => worksheet.addRow(isStts
                ? { kecamatan: item.kecamatan, desa: item.desa, jumlah: getTotal(item) }
                : {
                    kecamatan: item.kecamatan,
                    desa: item.desa,
                    ...Object.fromEntries(BOOK_FIELDS.map(field => [field, Number(item[field]) || 0])),
                    total: getTotal(item)
                }));

            worksheet.addRow(isStts
                ? { kecamatan: 'TOTAL KESELURUHAN', jumlah: totals.total }
                : { kecamatan: 'TOTAL KESELURUHAN', ...totals });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `arsip_${jenis}_${tahun}${kecamatan ? `_${kecamatan.toLowerCase().replace(/\s+/g, '_')}` : ''}${desa ? `_${desa.toLowerCase().replace(/\s+/g, '_')}` : ''}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
            setExportStatus('File Excel berhasil diunduh.');
        } catch (error) {
            console.error('Gagal membuat file Excel:', error);
            setExportStatus('Terjadi kesalahan saat membuat file Excel.');
        }
    }

    return (
        <div className="container archive-dashboard" data-jenis={jenis}>
            <header className="page-header">
                <div className="heading-copy">
                    <p className="eyebrow">ARSIP PAJAK BUMI DAN BANGUNAN</p>
                    <h1>Arsip Data {jenis.toUpperCase()}</h1>
                    <p className="header-description">Pantau ringkasan dan riwayat data {jenis.toUpperCase()} berdasarkan tahun dan wilayah.</p>
                </div>
                <div className="public-header-actions">
                    <nav className="tabs" aria-label="Jenis arsip">
                        <Link href="/" className={`tab${!isStts ? ' active' : ''}`} aria-current={!isStts ? 'page' : undefined}>SPPT</Link>
                        <Link href="/stts" className={`tab${isStts ? ' active' : ''}`} aria-current={isStts ? 'page' : undefined}>STTS</Link>
                    </nav>
                    <Link className="public-login-logo" href="/login" aria-label="Login admin" title="Login admin">
                        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                            <path d="M8 18.5 24 9l16 9.5v20H8v-20Z" />
                            <path d="M5 19.5 24 8l19 11.5M18 38.5v-12h12v12M15 20h.1M24 20h.1M33 20h.1" />
                        </svg>
                    </Link>
                </div>
            </header>

            <main>
                <section className="filters">
                    <div className="filter-group">
                        <label htmlFor="filter-tahun">Tahun:</label>
                        <select id="filter-tahun" value={tahun} onChange={event => setTahun(event.target.value)}>
                            <option value="">Pilih Tahun</option>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="filter-kecamatan">Kecamatan:</label>
                        <select id="filter-kecamatan" value={kecamatan} onChange={event => { setKecamatan(event.target.value); setDesa(''); }}>
                            <option value="">Semua Kecamatan</option>
                            {data.wilayah.map(item => <option key={item.kecamatan} value={item.kecamatan}>{item.kecamatan}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="filter-desa">Desa:</label>
                        <select id="filter-desa" value={desa} disabled={!district} onChange={event => setDesa(event.target.value)}>
                            <option value="">Semua Desa</option>
                            {district?.desa.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="filter-cari">Cari:</label>
                        <input id="filter-cari" value={cari} placeholder="Cari kecamatan atau desa..." onChange={event => setCari(event.target.value)} />
                    </div>
                    <button className="btn-reset" type="button" onClick={resetFilters}>Reset filter</button>
                </section>

                {kecamatan === 'Cijeruk' && (
                    <aside className="placeholder-notice" role="note">
                        Angka Cijeruk tahun 2016–2026 masih data sementara bernilai 0, bukan angka resmi.
                    </aside>
                )}

                <section className="cards" aria-label={`Ringkasan data ${jenis.toUpperCase()}`}>
                    {!isStts && BOOK_FIELDS.map((field, index) => (
                        <div className="card" key={field}>
                            <div className="card-value">{NUMBER_FORMAT.format(totals[field])}</div>
                            <div className="card-label">Buku {index + 1}</div>
                            <div className="card-desc">{['< Rp 100.000', 'Rp 100.000 - 500.000', 'Rp 500.000 - 2.000.000', 'Rp 2.000.000 - 5.000.000', '> Rp 5.000.000'][index]}</div>
                        </div>
                    ))}
                    <div className="card card-total">
                        <div className="card-value">{NUMBER_FORMAT.format(totals.total)}</div>
                        <div className="card-label">Total {jenis.toUpperCase()}</div>
                        <div className="card-desc">Tahun {tahun || '-'}</div>
                    </div>
                </section>

                <section className="data-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">RINCIAN WILAYAH</p>
                            <h2>Data {jenis.toUpperCase()} per desa</h2>
                            <p className="section-description">{isStts ? 'Jumlah STTS per tahun dan wilayah, tanpa kategori buku.' : 'Jumlah SPPT dikelompokkan menurut kategori buku.'}</p>
                        </div>
                        <div className="export-section">
                            <button className="btn-export" type="button" onClick={exportExcel}>Unduh Excel</button>
                            <span className="export-status" role="status" aria-live="polite">{exportStatus}</span>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Kecamatan</th><th>Desa</th>
                                    {isStts ? <th>Jumlah STTS</th> : <><th>Buku 1</th><th>Buku 2</th><th>Buku 3</th><th>Buku 4</th><th>Buku 5</th><th>Total</th></>}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.length === 0
                                    ? <tr><td colSpan={isStts ? 3 : 8} className="no-data">Tidak ada data untuk filter ini</td></tr>
                                    : tableRows.map((item, index) => item.dataUnavailable
                                        ? <tr key={`missing-${item.kecamatan}-${item.desa}`}><td>{item.kecamatan}</td><td>{item.desa}</td><td colSpan={isStts ? 1 : 6} className="no-data">Data belum tersedia{tahun ? ` untuk tahun ${tahun}` : ''}</td></tr>
                                        : <tr key={`${item.tahun}-${item.kecamatan}-${item.desa}-${index}`}>
                                            <td>{item.kecamatan}</td><td>{item.desa}</td>
                                            {isStts
                                                ? <td>{NUMBER_FORMAT.format(getTotal(item))}</td>
                                                : <>{BOOK_FIELDS.map(field => <td key={field}>{NUMBER_FORMAT.format(Number(item[field]) || 0)}</td>)}<td>{NUMBER_FORMAT.format(getTotal(item))}</td></>}
                                        </tr>)}
                            </tbody>
                        </table>
                    </div>
                </section>

                {!isStts && <section className="legend" aria-labelledby="legend-title">
                    <div className="section-heading compact"><div><p className="section-kicker">PANDUAN</p><h2 id="legend-title">Kategori buku</h2></div></div>
                    <ul>
                        <li><strong>Buku 1:</strong> Kurang dari Rp 100.000</li>
                        <li><strong>Buku 2:</strong> Rp 100.000 sampai Rp 500.000</li>
                        <li><strong>Buku 3:</strong> Rp 500.000 sampai Rp 2.000.000</li>
                        <li><strong>Buku 4:</strong> Rp 2.000.000 sampai Rp 5.000.000</li>
                        <li><strong>Buku 5:</strong> Di atas Rp 5.000.000</li>
                    </ul>
                </section>}

                <section className="history-section">
                    <div className="section-heading">
                        <div><p className="section-kicker">PERBANDINGAN TAHUNAN</p><h2>Riwayat {jenis.toUpperCase()}</h2><p className="section-description">Rekap seluruh wilayah atau kecamatan yang dipilih.</p></div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Tahun</th>{isStts ? <th>Jumlah STTS</th> : <><th>Buku 1</th><th>Buku 2</th><th>Buku 3</th><th>Buku 4</th><th>Buku 5</th><th>Total</th></>}</tr></thead>
                            <tbody>
                                {history.length === 0
                                    ? <tr><td colSpan={isStts ? 2 : 7} className="no-data">Tidak ada data riwayat</td></tr>
                                    : history.map(([year, values]) => <tr key={year}>
                                        <td>{year}</td>
                                        {isStts
                                            ? <td>{NUMBER_FORMAT.format(values.total)}</td>
                                            : <>{BOOK_FIELDS.map(field => <td key={field}>{NUMBER_FORMAT.format(values[field])}</td>)}<td>{NUMBER_FORMAT.format(values.total)}</td></>}
                                    </tr>)}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <footer><p className="footer-title">Arsip Data PBB</p><p className="footer-note">Sumber: Data internal arsip pajak bumi dan bangunan</p></footer>
        </div>
    );
}
