(function() {
    'use strict';

    const data = window.ARSIP_DATA;
    const fields = ['buku1', 'buku2', 'buku3', 'buku4', 'buku5'];
    const columns = ['tahun', 'kecamatan', 'desa', ...fields];
    const recordsByType = {
        sppt: Array.isArray(data && data.sppt) ? data.sppt.map(item => ({ ...item })) : [],
        stts: Array.isArray(data && data.stts) ? data.stts.map(item => ({ ...item })) : []
    };
    const datasetSelect = document.getElementById('dataset-select');
    const yearFilter = document.getElementById('year-filter');
    const searchFilter = document.getElementById('search-filter');
    const tableBody = document.getElementById('editor-tbody');
    const status = document.getElementById('editor-status');

    function showStatus(message, kind) {
        status.textContent = message;
        status.className = `admin-status${kind ? ` ${kind}` : ''}`;
    }

    function currentRecords() {
        return recordsByType[datasetSelect.value];
    }

    function updateYears() {
        const selected = yearFilter.value;
        const years = new Set(Array.from({ length: 11 }, (_, index) => 2016 + index));
        currentRecords().forEach(item => years.add(Number(item.tahun)));
        yearFilter.replaceChildren(new Option('Semua tahun', ''));
        [...years].filter(Number.isInteger).sort((a, b) => a - b).forEach(year => {
            yearFilter.add(new Option(String(year), String(year)));
        });
        yearFilter.value = [...years].some(year => String(year) === selected) ? selected : '';
    }

    function createInput(value, field, numeric) {
        const input = document.createElement('input');
        input.type = numeric ? 'number' : 'text';
        input.value = value == null ? '' : String(value);
        input.setAttribute('aria-label', field);
        if (numeric) {
            input.min = field === 'tahun' ? '2000' : '0';
            input.max = field === 'tahun' ? '2100' : '';
            input.step = '1';
            input.inputMode = 'numeric';
        }
        return input;
    }

    function render() {
        tableBody.replaceChildren();
        const query = searchFilter.value.trim().toLocaleLowerCase('id-ID');
        const selectedYear = yearFilter.value;
        const visibleRecords = currentRecords()
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                if (selectedYear && String(item.tahun) !== selectedYear) return false;
                const location = `${item.kecamatan} ${item.desa}`.toLocaleLowerCase('id-ID');
                return !query || location.includes(query);
            })
            .sort((left, right) =>
                Number(left.item.tahun) - Number(right.item.tahun) ||
                String(left.item.kecamatan).localeCompare(String(right.item.kecamatan), 'id') ||
                String(left.item.desa).localeCompare(String(right.item.desa), 'id')
            );

        if (visibleRecords.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 9;
            cell.className = 'no-data';
            cell.textContent = 'Tidak ada data untuk filter ini.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }

        visibleRecords.forEach(({ item, index }) => {
            const row = document.createElement('tr');
            columns.forEach(field => {
                const cell = document.createElement('td');
                const input = createInput(item[field], field, field === 'tahun' || fields.includes(field));
                input.addEventListener('change', () => {
                    item[field] = field === 'tahun' || fields.includes(field)
                        ? (input.value === '' ? '' : Number(input.value))
                        : input.value.trim();
                });
                cell.appendChild(input);
                row.appendChild(cell);
            });

            const actionCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'admin-remove-button';
            removeButton.textContent = 'Hapus';
            removeButton.setAttribute('aria-label', `Hapus data ${item.desa}, ${item.tahun}`);
            removeButton.addEventListener('click', () => {
                currentRecords().splice(index, 1);
                updateYears();
                render();
                showStatus('Baris dihapus dari editor. Unduh CSV untuk menyimpan perubahan.', '');
            });
            actionCell.appendChild(removeButton);
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

        showStatus(`${visibleRecords.length} baris ditampilkan. Perubahan hanya tersimpan sementara di halaman ini.`, '');
    }

    function validateRecords(records) {
        const seen = new Set();
        for (let index = 0; index < records.length; index += 1) {
            const item = records[index];
            const rowNumber = index + 2;
            if (!Number.isInteger(item.tahun) || item.tahun < 2000 || item.tahun > 2100) {
                throw new Error(`Baris ${rowNumber}: tahun harus bilangan bulat 2000–2100.`);
            }
            for (const field of ['kecamatan', 'desa']) {
                if (typeof item[field] !== 'string' || !item[field].trim() ||
                    /[\u0000-\u001f\u007f]/.test(item[field]) || /^[=+\-@]/.test(item[field].trim())) {
                    throw new Error(`Baris ${rowNumber}: ${field} harus diisi dengan teks yang valid.`);
                }
                item[field] = item[field].trim();
            }
            for (const field of fields) {
                if (!Number.isSafeInteger(item[field]) || item[field] < 0) {
                    throw new Error(`Baris ${rowNumber}: ${field} harus bilangan bulat nol atau lebih.`);
                }
            }

            const key = `${item.tahun}|${item.kecamatan.toLocaleLowerCase('id-ID')}|${item.desa.toLocaleLowerCase('id-ID')}`;
            if (seen.has(key)) {
                throw new Error(`Baris ${rowNumber}: kombinasi tahun, kecamatan, dan desa duplikat.`);
            }
            seen.add(key);
        }
    }

    function csvCell(value) {
        return `"${String(value).replace(/"/g, '""')}"`;
    }

    async function checkSession() {
        try {
            const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
            if (response.status === 401) {
                window.location.replace('/login.html');
                return false;
            }
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Sesi admin tidak bisa diperiksa.');
            }
            return true;
        } catch (error) {
            showStatus(error.message || 'Tidak dapat memeriksa sesi admin.', 'error');
            return false;
        }
    }

    document.getElementById('filter-form').addEventListener('submit', event => {
        event.preventDefault();
        render();
    });

    datasetSelect.addEventListener('change', () => {
        updateYears();
        render();
    });

    document.getElementById('add-row-button').addEventListener('click', () => {
        const latestYear = Math.max(2016, ...currentRecords().map(item => Number(item.tahun) || 0));
        const year = yearFilter.value ? Number(yearFilter.value) : latestYear;
        currentRecords().push({
            tahun: year,
            kecamatan: '',
            desa: '',
            buku1: 0,
            buku2: 0,
            buku3: 0,
            buku4: 0,
            buku5: 0
        });
        updateYears();
        yearFilter.value = String(year);
        searchFilter.value = '';
        render();
        showStatus('Baris baru ditambahkan. Lengkapi kecamatan dan desa, lalu unduh CSV.', '');
    });

    document.getElementById('download-button').addEventListener('click', () => {
        try {
            const records = currentRecords();
            validateRecords(records);
            const lines = [
                columns.map(csvCell).join(','),
                ...records.map(item => columns.map(field => csvCell(item[field])).join(','))
            ];
            const blob = new Blob(['\uFEFF', lines.join('\r\n'), '\r\n'], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${datasetSelect.value}.csv`;
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            showStatus(`File ${datasetSelect.value}.csv berhasil diunduh.`, 'success');
        } catch (error) {
            showStatus(error.message || 'CSV tidak dapat dibuat.', 'error');
        }
    });

    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: '{}'
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Logout gagal.');
            }
            window.location.assign('/login.html');
        } catch (error) {
            showStatus(error.message || 'Logout gagal.', 'error');
        }
    });

    checkSession().then(authenticated => {
        if (!authenticated) return;
        updateYears();
        render();
    });
})();
