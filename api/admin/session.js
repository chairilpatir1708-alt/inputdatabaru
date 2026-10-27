'use strict';

const {
    AdminConfigError,
    getAdminSession,
    requireMethod,
    sendJson,
    verifyAdminSession
} = require('../../lib/admin-auth.cjs');

module.exports = function session(req, res) {
    if (!requireMethod(req, res, 'GET')) return;

    try {
        if (!verifyAdminSession(getAdminSession(req))) {
            sendJson(res, 401, { error: 'Sesi admin tidak valid atau sudah berakhir.' });
            return;
        }
        sendJson(res, 200, { authenticated: true });
    } catch (error) {
        if (error instanceof AdminConfigError) {
            console.error('Konfigurasi login admin belum tersedia:', error.message);
            sendJson(res, 503, { error: 'Login admin belum dikonfigurasi di Vercel.' });
            return;
        }
        console.error('Gagal memeriksa sesi admin:', error);
        sendJson(res, 500, { error: 'Sesi admin gagal diperiksa.' });
    }
};
