/* StampScaner — temporary PIN gate.
 * Plain JS, no deps. SHA-256 via WebCrypto. Five valid PINs, only hashes here.
 * Unlock persists 30 days in localStorage (per browser). No server calls.
 *
 * Owner: Кагиров Абдул-Хаким Ахмадович (Аслан Каа).
 * Remove or empty PIN_HASHES to disable when public launch comes.
 */
(function () {
    'use strict';

    if (window.__stampscanerGate) return;
    window.__stampscanerGate = true;

    var KEY = 'stampscaner.unlock';
    var EXPIRY_DAYS = 30;
    var PIN_HASHES = [
        '3e4360471ed97c89d6c0ecb0ae0a888aa28a9576c4429c58f54c40176c1e2714',
        '0a44cd2cbce532cd9caae282721286ca5ee7d65f3fc119d9e1cd37341144615e',
        '831f7756d9ceeeaf55c495a005261772fbc546b15704cfa7fd300f9947ceb775',
        '8b76a77156d3a40827e29704a590372f844872f961094a7cf774ef67a1be62e9',
        '0409eab7d375cb35eccaff5c0d58f1cbba07e1987ca60bcb9fb79ae09fd794d2'
    ];

    // Already unlocked? Bail.
    try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
            var data = JSON.parse(raw);
            if (data && typeof data.until === 'number' && data.until > Date.now()) {
                return;
            }
        }
    } catch (e) {}

    // Inject styles immediately so anything painted by the host page is hidden.
    var style = document.createElement('style');
    style.id = 'pin-gate-style';
    style.textContent =
        'html.pin-gate-locked, html.pin-gate-locked body { overflow: hidden !important; height: 100%; }' +
        'html.pin-gate-locked body > *:not(#pin-gate) { filter: blur(18px) brightness(0.85); pointer-events: none !important; user-select: none !important; }' +
        '#pin-gate { position: fixed; inset: 0; z-index: 2147483646; display: flex; align-items: center; justify-content: center; background: rgba(20, 14, 10, 0.78); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; animation: pgFade 0.35s ease both; }' +
        '@keyframes pgFade { from { opacity: 0; } to { opacity: 1; } }' +
        '#pin-gate-card { background: #F8F2E4; color: #1A1410; max-width: 420px; width: calc(100% - 32px); padding: 36px 28px 28px; border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,0.45); text-align: center; border: 1px solid rgba(184, 146, 76, 0.4); }' +
        '#pin-gate h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.8rem; margin: 0 0 6px; color: #6B1F2E; font-weight: 600; }' +
        '#pin-gate p  { font-size: 0.95rem; color: #5A4A3A; margin: 0 0 22px; line-height: 1.5; }' +
        '#pin-gate input { width: 100%; padding: 14px 16px; font-size: 1.2rem; border-radius: 10px; border: 1.5px solid #D9CCB1; background: #FFFFFF; color: #1A1410; text-align: center; letter-spacing: 0.4em; font-family: "JetBrains Mono", "Consolas", monospace; outline: none; transition: border-color 0.2s ease, background 0.2s ease; box-sizing: border-box; }' +
        '#pin-gate input:focus { border-color: #6B1F2E; }' +
        '#pin-gate button { margin-top: 14px; width: 100%; padding: 14px; font-size: 1rem; font-weight: 600; background: #6B1F2E; color: #F5EDDC; border: none; border-radius: 10px; cursor: pointer; transition: background 0.2s ease; letter-spacing: 0.02em; }' +
        '#pin-gate button:hover { background: #4D1520; }' +
        '#pin-gate button:disabled { opacity: 0.5; cursor: wait; }' +
        '#pin-gate-err { margin-top: 12px; min-height: 1.2em; font-size: 0.88rem; color: #A33124; }' +
        '#pin-gate-card.shake { animation: pgShake 0.4s ease; }' +
        '@keyframes pgShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }' +
        '#pin-gate-brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.05rem; color: #B8924C; letter-spacing: 0.18em; margin-bottom: 6px; }' +
        '#pin-gate-foot { margin-top: 18px; font-size: 0.74rem; color: #8A7660; letter-spacing: 0.04em; }';

    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.documentElement.appendChild(style);
    }
    document.documentElement.classList.add('pin-gate-locked');

    function buildGate() {
        var overlay = document.createElement('div');
        overlay.id = 'pin-gate';
        overlay.innerHTML =
            '<div id="pin-gate-card" role="dialog" aria-modal="true" aria-labelledby="pg-title">' +
                '<div id="pin-gate-brand">STAMPSCANER</div>' +
                '<h1 id="pg-title">Закрытое тестирование</h1>' +
                '<p>Сайт временно закрыт. Введите PIN, выданный основателем.</p>' +
                '<form id="pin-gate-form" autocomplete="off">' +
                    '<input id="pin-gate-input" type="password" inputmode="numeric" ' +
                    'pattern="[0-9]*" maxlength="6" autocomplete="off" autocapitalize="off" ' +
                    'autocorrect="off" spellcheck="false" placeholder="• • • • • •" ' +
                    'aria-label="PIN" />' +
                    '<button type="submit" id="pin-gate-btn">Войти</button>' +
                '</form>' +
                '<div id="pin-gate-err" role="alert" aria-live="polite"></div>' +
                '<div id="pin-gate-foot">PIN запоминается 30 дней на этом устройстве.</div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = document.getElementById('pin-gate-input');
        var btn   = document.getElementById('pin-gate-btn');
        var err   = document.getElementById('pin-gate-err');
        var card  = document.getElementById('pin-gate-card');
        var form  = document.getElementById('pin-gate-form');

        setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);

        async function sha256Hex(text) {
            var enc = new TextEncoder().encode(text);
            var buf = await crypto.subtle.digest('SHA-256', enc);
            var bytes = new Uint8Array(buf);
            var hex = '';
            for (var i = 0; i < bytes.length; i++) {
                var h = bytes[i].toString(16);
                hex += h.length === 1 ? '0' + h : h;
            }
            return hex;
        }

        async function tryUnlock(pin) {
            if (!pin || pin.length < 4) {
                err.textContent = 'Введите PIN.';
                return;
            }
            btn.disabled = true;
            err.textContent = '';
            try {
                var hex = await sha256Hex(pin);
                var ok = PIN_HASHES.indexOf(hex) !== -1;
                if (ok) {
                    try {
                        localStorage.setItem(KEY, JSON.stringify({
                            until: Date.now() + EXPIRY_DAYS * 86400000
                        }));
                    } catch (e) {}
                    var gate = document.getElementById('pin-gate');
                    if (gate) gate.parentNode.removeChild(gate);
                    var s = document.getElementById('pin-gate-style');
                    if (s) s.parentNode.removeChild(s);
                    document.documentElement.classList.remove('pin-gate-locked');
                    return;
                }
                err.textContent = 'Неверный PIN. Попробуйте ещё раз.';
                card.classList.remove('shake');
                void card.offsetWidth;
                card.classList.add('shake');
                input.value = '';
                input.focus();
            } catch (e) {
                err.textContent = 'Ошибка проверки PIN: ' + (e && e.message ? e.message : e);
            } finally {
                btn.disabled = false;
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            tryUnlock(input.value.trim());
        });

        // Submit on Enter even if the form swallows the event.
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                tryUnlock(input.value.trim());
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildGate);
    } else {
        buildGate();
    }
})();
