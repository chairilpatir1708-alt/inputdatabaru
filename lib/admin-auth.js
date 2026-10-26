import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'arsip_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.includes('replace-with-') || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('ADMIN_SESSION_SECRET harus diatur dan minimal 32 byte.');
    }
    return secret;
}

function safeStringEqual(left, right) {
    const leftHash = createHash('sha256').update(left).digest();
    const rightHash = createHash('sha256').update(right).digest();
    return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminPassword(password) {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword || configuredPassword.includes('replace-with-') || configuredPassword.length < 12) {
        throw new Error('ADMIN_PASSWORD harus diatur dan minimal 12 karakter.');
    }
    return safeStringEqual(password, configuredPassword);
}

export function createAdminSession() {
    const payload = Buffer.from(JSON.stringify({
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE
    })).toString('base64url');
    const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
    return `${payload}.${signature}`;
}

export function verifyAdminSession(token) {
    if (!token || typeof token !== 'string') return false;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return false;

    const expected = createHmac('sha256', getSessionSecret()).update(payload).digest();
    let received;
    try {
        received = Buffer.from(signature, 'base64url');
    } catch {
        return false;
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;

    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return session.role === 'admin' &&
            Number.isSafeInteger(session.expiresAt) &&
            session.expiresAt > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}
