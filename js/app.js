// app.js - Logika utama aplikasi untuk SPPT dan STTS

(function() {
    'use strict';

    // Deteksi jenis halaman (sppt atau stts)
    const jenis = document.body.getAttribute('data-jenis') || 'sppt';
    const arsipData = window.ARSIP_DATA;
    const dataSource = arsipData && arsipData[jenis];

    if (!Array.isArray(dataSource) || !Array.isArray(arsipData.wilayah)) {
        const message = 'Data arsip tidak tersedia. Periksa file data/data.js lalu muat ulang halaman.';
        document.getElementById('data-tbody').innerHTML =
            `<tr><td colspan="8" class="no-data">${message}</td></tr>`;
        document.getElementById('history-tbody').innerHTML =
            `<tr><td colspan="7" class="no-data">${message}</td></tr>`;
        document.getElementById('btn-export').disabled = true;
        return;
    }

    // State filter
    let currentFilters = {
        tahun: '',
        kecamatan: '',
        desa: '',
        cari: ''
    };
    let defaultYear = '';

    // Format angka dengan pemisah ribuan Indonesia
    function formatAngka(angka) {
        return new Intl.NumberFormat('id-ID').format(angka);
    }

    // Ambil parameter URL
    function getURLParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            tahun: params.get('tahun') || '',
            kecamatan: params.get('kecamatan') || '',
            desa: params.get('desa') || '',
            cari: params.get('q') || ''
        };
    }

    // Set parameter URL
    function setURLParams(filters) {
        const params = new URLSearchParams();
        if (filters.tahun) params.set('tahun', filters.tahun);
        if (filters.kecamatan) params.set('kecamatan', filters.kecamatan);
        if (filters.desa) params.set('desa', filters.desa);
        if (filters.cari) params.set('q', filters.cari);
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }

    // Inisialisasi filter dari URL
    function initFilters() {
        currentFilters = getURLParams();
        
        // Populate dropdown tahun
        const tahunSet = new Set();
        dataSource.forEach(item => tahunSet.add(item.tahun));
        const tahunList = Array.from(tahunSet).sort((a, b) => b - a);
        defaultYear = String(tahunList[0] || '');
        if (!tahunList.some(tahun => String(tahun) === currentFilters.tahun)) {
            currentFilters.tahun = defaultYear;
        }
        
        const selectTahun = document.getElementById('filter-tahun');
        tahunList.forEach(tahun => {
            const option = document.createElement('option');
            option.value = tahun;
            option.textContent = tahun;
            if (currentFilters.tahun === String(tahun)) {
                option.selected = true;
            }
            selectTahun.appendChild(option);
        });

        // Populate dropdown kecamatan
        const selectKecamatan = document.getElementById('filter-kecamatan');
        window.ARSIP_DATA.wilayah.forEach(w => {
            const option = document.createElement('option');
            option.value = w.kecamatan;
            option.textContent = w.kecamatan;
            if (currentFilters.kecamatan === w.kecamatan) {
                option.selected = true;
            }
            selectKecamatan.appendChild(option);
        });

        // Update dropdown desa berdasarkan kecamatan
        updateDesaDropdown();

        // Set nilai input cari
        document.getElementById('filter-cari').value = currentFilters.cari;
    }

    // Update dropdown desa
    function updateDesaDropdown() {
        const selectDesa = document.getElementById('filter-desa');
        selectDesa.innerHTML = '<option value="">Semua Desa</option>';
        
        if (!currentFilters.kecamatan) {
            selectDesa.disabled = true;
            currentFilters.desa = '';
            return;
        }

        selectDesa.disabled = false;
        const wilayah = window.ARSIP_DATA.wilayah.find(w => w.kecamatan === currentFilters.kecamatan);
        
        if (wilayah) {
            if (!wilayah.desa.includes(currentFilters.desa)) {
                currentFilters.desa = '';
            }
            wilayah.desa.forEach(desa => {
                const option = document.createElement('option');
                option.value = desa;
                option.textContent = desa;
                if (currentFilters.desa === desa) {
                    option.selected = true;
                }
                selectDesa.appendChild(option);
            });
        }
    }

    // Filter data
    function filterData() {
        let filtered = dataSource.filter(item => {
            if (currentFilters.tahun && String(item.tahun) !== currentFilters.tahun) return false;
            if (currentFilters.kecamatan && item.kecamatan !== currentFilters.kecamatan) return false;
            if (currentFilters.desa && item.desa !== currentFilters.desa) return false;
            if (currentFilters.cari) {
                const search = currentFilters.cari.toLowerCase();
                const kecMatch = item.kecamatan.toLowerCase().includes(search);
                const desaMatch = item.desa.toLowerCase().includes(search);
                if (!kecMatch && !desaMatch) return false;
            }
            return true;
        });

        // Sort berdasarkan urutan wilayah
        filtered.sort((a, b) => {
            const indexA = getWilayahIndex(a.kecamatan, a.desa);
            const indexB = getWilayahIndex(b.kecamatan, b.desa);
            return indexA - indexB;
        });

        return filtered;
    }

    // Dapatkan index urutan wilayah
    function getWilayahIndex(kecamatan, desa) {
        let index = 0;
        for (const w of window.ARSIP_DATA.wilayah) {
            if (w.kecamatan === kecamatan) {
                const desaIndex = w.desa.indexOf(desa);
                return index + (desaIndex >= 0 ? desaIndex : 0);
            }
            index += w.desa.length;
        }
        return index;
    }

    // Update kartu ringkasan
    function updateCards(data) {
        const sums = {
            buku1: 0,
            buku2: 0,
            buku3: 0,
            buku4: 0,
            buku5: 0
        };

        data.forEach(item => {
            sums.buku1 += item.buku1 || 0;
            sums.buku2 += item.buku2 || 0;
            sums.buku3 += item.buku3 || 0;
            sums.buku4 += item.buku4 || 0;
            sums.buku5 += item.buku5 || 0;
        });

        const total = sums.buku1 + sums.buku2 + sums.buku3 + sums.buku4 + sums.buku5;

        document.getElementById('card-buku1').textContent = formatAngka(sums.buku1);
        document.getElementById('card-buku2').textContent = formatAngka(sums.buku2);
        document.getElementById('card-buku3').textContent = formatAngka(sums.buku3);
        document.getElementById('card-buku4').textContent = formatAngka(sums.buku4);
        document.getElementById('card-buku5').textContent = formatAngka(sums.buku5);
        document.getElementById('card-total').textContent = formatAngka(total);
        document.getElementById('card-tahun').textContent = 'Tahun ' + (currentFilters.tahun || '-');
    }

    // Update tabel data
    function updateTable(data) {
        const tbody = document.getElementById('data-tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 8;
            td.className = 'no-data';
            td.textContent = 'Tidak ada data untuk filter ini';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            const total = (item.buku1||0) + (item.buku2||0) + (item.buku3||0) + (item.buku4||0) + (item.buku5||0);
            
            ['kecamatan', 'desa', 'buku1', 'buku2', 'buku3', 'buku4', 'buku5'].forEach(field => {
                const td = document.createElement('td');
                if (field === 'kecamatan' || field === 'desa') {
                    td.textContent = item[field];
                } else {
                    td.textContent = formatAngka(item[field] || 0);
                }
                tr.appendChild(td);
            });

            const tdTotal = document.createElement('td');
            tdTotal.textContent = formatAngka(total);
            tr.appendChild(tdTotal);

            tbody.appendChild(tr);
        });
    }

    // Update tabel riwayat
    function updateHistory() {
        const tbody = document.getElementById('history-tbody');
        tbody.innerHTML = '';

        // Filter hanya berdasarkan kecamatan (tidak peduli tahun, desa, cari)
        let dataForHistory = dataSource;
        if (currentFilters.kecamatan) {
            dataForHistory = dataSource.filter(item => item.kecamatan === currentFilters.kecamatan);
        }

        // Group by tahun
        const groupedByYear = {};
        dataForHistory.forEach(item => {
            if (!groupedByYear[item.tahun]) {
                groupedByYear[item.tahun] = {
                    buku1: 0,
                    buku2: 0,
                    buku3: 0,
                    buku4: 0,
                    buku5: 0
                };
            }
            groupedByYear[item.tahun].buku1 += item.buku1 || 0;
            groupedByYear[item.tahun].buku2 += item.buku2 || 0;
            groupedByYear[item.tahun].buku3 += item.buku3 || 0;
            groupedByYear[item.tahun].buku4 += item.buku4 || 0;
            groupedByYear[item.tahun].buku5 += item.buku5 || 0;
        });

        // Sort descending
        const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

        if (years.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.className = 'no-data';
            td.textContent = 'Tidak ada data riwayat';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        years.forEach(year => {
            const data = groupedByYear[year];
            const total = data.buku1 + data.buku2 + data.buku3 + data.buku4 + data.buku5;

            const tr = document.createElement('tr');
            
            const tdYear = document.createElement('td');
            tdYear.textContent = year;
            tr.appendChild(tdYear);

            [data.buku1, data.buku2, data.buku3, data.buku4, data.buku5, total].forEach(value => {
                const td = document.createElement('td');
                td.textContent = formatAngka(value);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    // Render semua
    function render() {
        const filteredData = filterData();
        updateCards(filteredData);
        updateTable(filteredData);
        updateHistory();
        setURLParams(currentFilters);
        
        // Update global untuk export
        window.currentFilteredData = filteredData;
    }

    // Event listeners
    document.getElementById('filter-tahun').addEventListener('change', function(e) {
        currentFilters.tahun = e.target.value;
        render();
    });

    document.getElementById('filter-kecamatan').addEventListener('change', function(e) {
        currentFilters.kecamatan = e.target.value;
        currentFilters.desa = ''; // Reset desa
        updateDesaDropdown();
        render();
    });

    document.getElementById('filter-desa').addEventListener('change', function(e) {
        currentFilters.desa = e.target.value;
        render();
    });

    document.getElementById('filter-cari').addEventListener('input', function(e) {
        currentFilters.cari = e.target.value;
        render();
    });

    document.getElementById('btn-reset').addEventListener('click', function() {
        // Reset ke tahun terbaru, sama seperti tampilan awal.
        const tahunSelect = document.getElementById('filter-tahun');
        currentFilters.tahun = defaultYear;
        tahunSelect.value = defaultYear;
        
        currentFilters.kecamatan = '';
        document.getElementById('filter-kecamatan').selectedIndex = 0;
        
        currentFilters.desa = '';
        updateDesaDropdown();
        
        currentFilters.cari = '';
        document.getElementById('filter-cari').value = '';
        
        render();
    });

    // Initialize
    initFilters();
    render();

    // Expose untuk export
    window.getCurrentFilters = function() { return currentFilters; };
    window.getJenis = function() { return jenis; };

})();
