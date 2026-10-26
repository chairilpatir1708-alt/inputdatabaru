'use client';

import { useState } from 'react';

export default function AdminLogout() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function logout() {
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/api/admin/logout', { method: 'POST' });
            if (!response.ok) throw new Error('Server menolak permintaan logout.');
            window.location.assign('/login');
        } catch (logoutError) {
            console.error('Gagal logout:', logoutError);
            setError('Tidak dapat logout. Coba lagi saat koneksi server pulih.');
            setBusy(false);
        }
    }

    return (
        <>
            {error && <span className="export-status error" role="alert">{error}</span>}
            <button className="btn-reset" type="button" onClick={logout} disabled={busy}>
                {busy ? 'Keluar...' : 'Keluar'}
            </button>
        </>
    );
}
