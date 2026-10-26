'use client';

import { useState } from 'react';

export default function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || 'Login gagal.');
                return;
            }
            window.location.assign('/admin');
        } catch {
            setError('Tidak dapat menghubungi server. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="login-brand" aria-label="Arsip PBB Admin">
                    <span className="login-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none">
                            <path d="M8 18.5 24 9l16 9.5v20H8v-20Z" />
                            <path d="M5 19.5 24 8l19 11.5M18 38.5v-12h12v12M15 20h.1M24 20h.1M33 20h.1" />
                        </svg>
                    </span>
                    <span>ARSIP PBB <span className="login-brand-divider">/</span> ADMIN</span>
                </div>
                <p className="eyebrow">AREA PENGELOLAAN</p>
                <h1>Login Admin</h1>
                <p className="section-description">Masukkan kata sandi admin untuk mengelola data SPPT.</p>
                <form className="login-form" onSubmit={submit}>
                    <label htmlFor="admin-password">Kata sandi admin</label>
                    <input
                        autoComplete="current-password"
                        id="admin-password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        required
                    />
                    {error && <p className="login-error" role="alert">{error}</p>}
                    <button className="btn-export" type="submit" disabled={submitting}>
                        {submitting ? 'Memeriksa...' : 'Masuk'}
                    </button>
                </form>
                <a className="login-back" href="/">Kembali ke arsip</a>
            </section>
        </main>
    );
}
