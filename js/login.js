(function() {
    'use strict';

    const form = document.getElementById('login-form');
    const passwordInput = document.getElementById('admin-password');
    const status = document.getElementById('login-status');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        status.textContent = 'Memeriksa kata sandi...';
        status.className = 'admin-status';

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ password: passwordInput.value })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Login gagal.');
            }
            window.location.assign('/admin.html');
        } catch (error) {
            status.textContent = error.message || 'Login gagal. Periksa koneksi dan coba lagi.';
            status.classList.add('error');
            passwordInput.focus();
        }
    });
})();
