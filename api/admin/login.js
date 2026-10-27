'use strict';

const {
    ADMIN_SESSION_MAX_AGE,
    AdminConfigError,
    createAdminSession,
    isSameOrigin,
    readJsonBody,
    requireMethod,
    sendJson,
    sessionCookie,
    verifyAdminCredentials
} = require('../../lib/admin-auth.cjs');

module.exports = async function login(req, res) {
    if (!requireMethod(req, res, 'POST')) return;
    if (!isSameOrigin(req)) {
        sendJson(res, 403, { error: 'Permintaan login tidak diizinkan.' });
        return;
    }
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
        sendJson(res, 415, { error: 'Format permintaan tidak didukung.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req);
    } catch (error) {
        if (error instanceof RangeError) {
            sendJson(res, 413, { error: 'Permintaan terlalu besar.' });
            return;
        }
        if (error instanceof SyntaxError || error instanceof TypeError) {
            sendJson(res, 400, { error: 'Permintaan tidak valid.' });
            return;
        }
        console.error('Gagal membaca permintaan login admin:', error);
        sendJson(res, 500, { error: 'Permintaan login admin gagal diproses.' });
        return;
    }

    if (typeof body.username !== 'string' || body.username.trim().length === 0 ||
        body.username.length > 256 || typeof body.password !== 'string' ||
        body.password.length === 0 || body.password.length > 1024) {
        sendJson(res, 400, { error: 'Username atau kata sandi tidak valid.' });
        return;
    }

    try {
        if (!verifyAdminCredentials(body.username.trim(), body.password)) {
            sendJson(res, 401, { error: 'Username atau kata sandi salah.' });
            return;
        }
        sendJson(res, 200, { success: true }, {
            'Set-Cookie': sessionCookie(req, createAdminSession(), ADMIN_SESSION_MAX_AGE)
        });
    } catch (error) {
        if (error instanceof AdminConfigError) {
            console.error('Konfigurasi login admin belum tersedia:', error.message);
            sendJson(res, 503, { error: 'Login admin belum dikonfigurasi di Vercel.' });
            return;
        }
        console.error('Gagal membuat sesi admin:', error);
        sendJson(res, 500, { error: 'Login admin gagal diproses.' });
    }
};
