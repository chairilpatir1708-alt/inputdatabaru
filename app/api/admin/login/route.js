import { NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_MAX_AGE,
    createAdminSession,
    verifyAdminPassword
} from '../../../../lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request) {
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
        return NextResponse.json({ error: 'Format permintaan tidak didukung.' }, { status: 415 });
    }

    let password;
    try {
        const body = await request.text();
        if (body.length > 2048) {
            return NextResponse.json({ error: 'Permintaan terlalu besar.' }, { status: 413 });
        }
        ({ password } = JSON.parse(body));
    } catch {
        return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length > 1024) {
        return NextResponse.json({ error: 'Kata sandi tidak valid.' }, { status: 400 });
    }

    try {
        if (!verifyAdminPassword(password)) {
            return NextResponse.json({ error: 'Kata sandi salah.' }, { status: 401 });
        }

        const response = NextResponse.json({ success: true });
        response.cookies.set({
            name: ADMIN_SESSION_COOKIE,
            value: createAdminSession(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: ADMIN_SESSION_MAX_AGE
        });
        return response;
    } catch (error) {
        console.error('Konfigurasi login admin tidak tersedia:', error);
        return NextResponse.json({ error: 'Login admin belum dikonfigurasi di server.' }, { status: 503 });
    }
}
