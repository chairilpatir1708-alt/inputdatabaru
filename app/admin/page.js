import AdminEditor from '../../components/admin-editor';
import AdminLogout from '../../components/admin-logout';
import archiveData from '../../data/arsip-data.json';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../lib/admin-auth';

export const metadata = {
    title: 'Admin Data SPPT',
    robots: {
        index: false,
        follow: false
    }
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const cookieStore = await cookies();
    if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        redirect('/login');
    }
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Link className="admin-brand" href="/admin" aria-label="Arsip PBB, panel admin">
                    <span className="admin-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none">
                            <path d="M8 18.5 24 9l16 9.5v20H8v-20Z" />
                            <path d="M5 19.5 24 8l19 11.5M18 38.5v-12h12v12M15 20h.1M24 20h.1M33 20h.1" />
                        </svg>
                    </span>
                    <span className="admin-brand-copy">
                        <strong>ARSIP PBB</strong>
                        <span>PANEL ADMIN</span>
                    </span>
                </Link>

                <p className="admin-nav-heading">MENU UTAMA</p>
                <nav className="admin-sidebar-nav" aria-label="Navigasi admin">
                    <Link className="admin-nav-link active" href="/admin" aria-current="page">
                        <span className="admin-nav-icon" aria-hidden="true">▦</span>
                        Kelola data SPPT
                    </Link>
                    <Link className="admin-nav-link" href="/">
                        <span className="admin-nav-icon" aria-hidden="true">↗</span>
                        Lihat halaman SPPT
                    </Link>
                    <Link className="admin-nav-link" href="/stts">
                        <span className="admin-nav-icon" aria-hidden="true">↗</span>
                        Lihat halaman STTS
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    <span className="admin-secure-dot" aria-hidden="true" />
                    Halaman admin terlindungi
                </div>
            </aside>

            <div className="admin-workspace">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-breadcrumb">Panel Admin <span>/</span> Data SPPT</p>
                        <p className="admin-topbar-title">Pengelolaan arsip</p>
                    </div>
                    <AdminLogout />
                </header>
                <AdminEditor data={archiveData} />
            </div>
        </div>
    );
}
