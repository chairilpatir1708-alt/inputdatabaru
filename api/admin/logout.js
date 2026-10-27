'use strict';

const { isSameOrigin, requireMethod, sendJson, sessionCookie } = require('../../lib/admin-auth.cjs');

module.exports = function logout(req, res) {
    if (!requireMethod(req, res, 'POST')) return;
    if (!isSameOrigin(req)) {
        sendJson(res, 403, { error: 'Permintaan logout tidak diizinkan.' });
        return;
    }
    sendJson(res, 200, { success: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });
};
