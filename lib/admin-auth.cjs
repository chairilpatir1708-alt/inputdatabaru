'use strict';

const crypto = require('node:crypto');

const ADMIN_SESSION_COOKIE = 'arsip_admin_session';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

class AdminConfigError extends Error {}

function getAdminPassword() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password.length < 12) {
        throw new AdminConfigError('ADMIN_PASSWORD harus diatur dan minimal 12 karakter.');
    }
    return password;
}

function getSessionSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new AdminConfigError('ADMIN_SESSION_SECRET harus diatur dan minimal 32 byte.');
    }
    return secret;
}

function safeStringEqual(left, right) {
    const leftHash = crypto.createHash('sha256').update(left).digest();
    const rightHash = crypto.createHash('sha256').update(right).digest();
    return crypto.timingSafeEqual(leftHash, rightHash);
}

function verifyAdminPassword(password) {
    return safeStringEqual(password, getAdminPassword());
}

function signPayload(payload) {
    return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function createAdminSession() {
    const payload = Buffer.from(JSON.stringify({
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE
    })).toString('base64url');
    return `${payload}.${signPayload(payload)}`;
}

function verifyAdminSession(token) {
    if (!token || typeof token !== 'string') return false;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return false;

    const expected = Buffer.from(signPayload(payload), 'base64url');
    let received;
    try {
        received = Buffer.from(signature, 'base64url');
    } catch {
        return false;
    }
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false;

    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return session.role === 'admin' &&
            Number.isSafeInteger(session.expiresAt) &&
            session.expiresAt > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

function getAdminSession(req) {
    const cookies = String(req.headers.cookie || '').split(';');
    const entry = cookies.find(cookie => cookie.trim().startsWith(`${ADMIN_SESSION_COOKIE}=`));
    return entry ? entry.trim().slice(ADMIN_SESSION_COOKIE.length + 1) : '';
}

function isSameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return false;

    try {
        const originHost = new URL(origin).host;
        const requestHost = req.headers.host;
        return Boolean(requestHost) && originHost === requestHost;
    } catch {
        return false;
    }
}

function sendJson(res, status, body, headers = {}) {
    res.statusCode = status;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value));
    res.end(JSON.stringify(body));
}

function requireMethod(req, res, method) {
    if (req.method === method) return true;
    sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: method });
    return false;
}

async function readJsonBody(req) {
    const body = req.body;
    let serialized;
    if (body === undefined) {
        const chunks = [];
        let length = 0;
        for await (const chunk of req) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            length += buffer.length;
            if (length > 2048) throw new RangeError('Ukuran permintaan terlalu besar.');
            chunks.push(buffer);
        }
        serialized = Buffer.concat(chunks).toString('utf8');
    } else if (Buffer.isBuffer(body)) {
        serialized = body.toString('utf8');
    } else {
        serialized = typeof body === 'string' ? body : JSON.stringify(body);
    }

    if (!serialized || Buffer.byteLength(serialized, 'utf8') > 2048) {
        throw new RangeError('Ukuran permintaan terlalu besar.');
    }
    const parsed = body === undefined || Buffer.isBuffer(body) || typeof body === 'string'
        ? JSON.parse(serialized)
        : body;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new TypeError('Format permintaan tidak valid.');
    }
    return parsed;
}

function sessionCookie(req, value, maxAge) {
    const secure = process.env.VERCEL_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

module.exports = {
    ADMIN_SESSION_MAX_AGE,
    AdminConfigError,
    createAdminSession,
    getAdminSession,
    isSameOrigin,
    readJsonBody,
    requireMethod,
    sendJson,
    sessionCookie,
    verifyAdminPassword,
    verifyAdminSession
};
