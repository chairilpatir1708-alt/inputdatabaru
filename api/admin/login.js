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
    verifyAdminPassword
} = require('../../lib/admin-auth.cjs');

module.exports = function login(req, res) {
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
        body = readJsonBody(req);
    } catch (error) {
        const tooLarge = error instanceof RangeError;
        sendJson(res, tooLarge ? 413 : 400, { error: tooLarge ? 'Permintaan terlalu besar.' : 'Permintaan tidak valid.' });
        return;
    }

    if (typeof body.password !== 'string' || body.password.length > 1024) {
        sendJson(res, 400, { error: 'Kata sandi tidak valid.' });
        return;
    }

    try {
        if (!verifyAdminPassword(body.password)) {
            sendJson(res, 401, { error: 'Kata sandi salah.' });
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
