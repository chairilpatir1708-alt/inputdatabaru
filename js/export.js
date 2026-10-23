// export.js - Export data ke Excel menggunakan ExcelJS

(function() {
    'use strict';

    const btnExport = document.getElementById('btn-export');
    const exportStatus = document.getElementById('export-status');

    if (!btnExport) return;

    btnExport.addEventListener('click', async function() {
        // Cek apakah ExcelJS tersedia
        if (typeof ExcelJS === 'undefined') {
            exportStatus.textContent = 'Export Excel tidak tersedia, periksa koneksi internet';
            exportStatus.className = 'export-status error';
            return;
        }

        // Ambil data yang sedang difilter
        const data = window.currentFilteredData;
        if (!data || data.length === 0) {
            exportStatus.textContent = 'Tidak ada data untuk di-export';
            exportStatus.className = 'export-status error';
            setTimeout(() => {
                exportStatus.textContent = '';
            }, 3000);
            return;
        }

        try {
            btnExport.disabled = true;
            exportStatus.textContent = 'Membuat file Excel...';
            exportStatus.className = 'export-status';

            const filters = window.getCurrentFilters();
            const jenis = window.getJenis();

            // Buat workbook
            const workbook = new ExcelJS.Workbook();
            const sheetName = `Arsip ${jenis.toUpperCase()} ${filters.tahun}`;
            const worksheet = workbook.addWorksheet(sheetName);

            // Header
            worksheet.columns = [
                { header: 'Kecamatan', key: 'kecamatan', width: 20 },
                { header: 'Desa', key: 'desa', width: 25 },
                { header: 'Buku 1', key: 'buku1', width: 12 },
                { header: 'Buku 2', key: 'buku2', width: 12 },
                { header: 'Buku 3', key: 'buku3', width: 12 },
                { header: 'Buku 4', key: 'buku4', width: 12 },
                { header: 'Buku 5', key: 'buku5', width: 12 },
                { header: 'Total', key: 'total', width: 15 }
            ];

            // Style header
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF3F4F6' }
            };

            // Group data per kecamatan
            const groupedData = {};
            data.forEach(item => {
                if (!groupedData[item.kecamatan]) {
                    groupedData[item.kecamatan] = [];
                }
                groupedData[item.kecamatan].push(item);
            });

            const kecamatans = Object.keys(groupedData).sort();
            const multipleKecamatan = kecamatans.length > 1;

            let grandTotal = { buku1: 0, buku2: 0, buku3: 0, buku4: 0, buku5: 0, total: 0 };

            // Isi data
            kecamatans.forEach((kecamatan, idx) => {
                const items = groupedData[kecamatan];
                let subtotal = { buku1: 0, buku2: 0, buku3: 0, buku4: 0, buku5: 0 };

                items.forEach(item => {
                    const total = (item.buku1||0) + (item.buku2||0) + (item.buku3||0) + (item.buku4||0) + (item.buku5||0);
                    
                    worksheet.addRow({
                        kecamatan: item.kecamatan,
                        desa: item.desa,
                        buku1: item.buku1 || 0,
                        buku2: item.buku2 || 0,
                        buku3: item.buku3 || 0,
                        buku4: item.buku4 || 0,
                        buku5: item.buku5 || 0,
                        total: total
                    });

                    subtotal.buku1 += item.buku1 || 0;
                    subtotal.buku2 += item.buku2 || 0;
                    subtotal.buku3 += item.buku3 || 0;
                    subtotal.buku4 += item.buku4 || 0;
                    subtotal.buku5 += item.buku5 || 0;
                });

                const subtotalSum = subtotal.buku1 + subtotal.buku2 + subtotal.buku3 + subtotal.buku4 + subtotal.buku5;

                // Tambahkan subtotal jika lebih dari 1 kecamatan
                if (multipleKecamatan) {
                    const subtotalRow = worksheet.addRow({
                        kecamatan: `SUBTOTAL ${kecamatan.toUpperCase()}`,
                        desa: '',
                        buku1: subtotal.buku1,
                        buku2: subtotal.buku2,
                        buku3: subtotal.buku3,
                        buku4: subtotal.buku4,
                        buku5: subtotal.buku5,
                        total: subtotalSum
                    });
                    subtotalRow.font = { bold: true };
                    
                    // Baris kosong setelah subtotal
                    if (idx < kecamatans.length - 1) {
                        worksheet.addRow({});
                    }
                }

                grandTotal.buku1 += subtotal.buku1;
                grandTotal.buku2 += subtotal.buku2;
                grandTotal.buku3 += subtotal.buku3;
                grandTotal.buku4 += subtotal.buku4;
                grandTotal.buku5 += subtotal.buku5;
            });

            grandTotal.total = grandTotal.buku1 + grandTotal.buku2 + grandTotal.buku3 + grandTotal.buku4 + grandTotal.buku5;

            // Total keseluruhan
            const totalRow = worksheet.addRow({
                kecamatan: 'TOTAL KESELURUHAN',
                desa: '',
                buku1: grandTotal.buku1,
                buku2: grandTotal.buku2,
                buku3: grandTotal.buku3,
                buku4: grandTotal.buku4,
                buku5: grandTotal.buku5,
                total: grandTotal.total
            });
            totalRow.font = { bold: true };
            totalRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD1FAE5' }
            };

            // Format angka
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    for (let col = 3; col <= 8; col++) {
                        const cell = row.getCell(col);
                        cell.numFmt = '#,##0';
                    }
                }
            });

            // Border untuk semua cell
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Nama file
            let filename = `arsip_${jenis}_${filters.tahun}`;
            if (filters.kecamatan) {
                filename += `_${filters.kecamatan.toLowerCase().replace(/\s+/g, '_')}`;
            }
            if (filters.desa) {
                filename += `_${filters.desa.toLowerCase().replace(/\s+/g, '_')}`;
            }
            filename += '.xlsx';

            // Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            exportStatus.textContent = `✓ File ${filename} berhasil diunduh`;
            exportStatus.className = 'export-status success';
            setTimeout(() => {
                exportStatus.textContent = '';
            }, 5000);

        } catch (error) {
            console.error('Error exporting:', error);
            exportStatus.textContent = 'Terjadi kesalahan saat membuat file Excel';
            exportStatus.className = 'export-status error';
        } finally {
            btnExport.disabled = false;
        }
    });

})();
