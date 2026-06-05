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
        '#pin-gate-foot { margin-top: 18px; font-size: 0.74rem; color: #8A7660; letter-spacing: 0.04em; }' +
        '#pin-gate-apk { margin-top: 22px; padding-top: 20px; border-top: 1px solid rgba(184,146,76,0.35); display: flex; align-items: center; gap: 14px; text-align: left; }' +
        '#pin-gate-apk img { width: 88px; height: 88px; flex: 0 0 88px; border: 1px solid rgba(184,146,76,0.5); border-radius: 10px; padding: 5px; background: #fff; }' +
        '#pin-gate-apk-text { font-size: 0.82rem; color: #5A4A3A; line-height: 1.45; }' +
        '#pin-gate-apk-text strong { display: block; color: #6B1F2E; font-size: 0.9rem; margin-bottom: 3px; }' +
        '#pin-gate-apk-link { display: block; flex: 0 0 auto; line-height: 0; }';

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
                '<div id="pin-gate-apk">' +
                    '<a id="pin-gate-apk-link" href="https://github.com/aslankaa1-droid/stampscaner-com/releases/download/app-v1.0/StampScaner-v1.0.apk" download aria-label="Скачать приложение StampScaner для Android">' +
                        '<img src="/app/qrcode-install.png" alt="QR-код для установки приложения StampScaner на Android" />' +
                    '</a>' +
                    '<div id="pin-gate-apk-text">' +
                        '<strong>📱 Приложение для Android</strong>' +
                        'Наведите камеру телефона на QR-код, чтобы скачать и установить приложение StampScaner на смартфон Android. PIN для этого не нужен.' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = document.getElementById('pin-gate-input');
        var btn   = document.getElementById('pin-gate-btn');
        var err   = document.getElementById('pin-gate-err');
        var card  = document.getElementById('pin-gate-card');
        var form  = document.getElementById('pin-gate-form');

        setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);

        async function sha256Hex(text) {
            // Native WebCrypto (only available in secure context: HTTPS / localhost).
            if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
                try {
                    var enc = new TextEncoder().encode(text);
                    var buf = await crypto.subtle.digest('SHA-256', enc);
                    return toHex(new Uint8Array(buf));
                } catch (e) { /* fall through to JS implementation */ }
            }
            // Pure-JS SHA-256 fallback (works on plain HTTP, no external libs).
            return jsSha256(text);
        }

        function toHex(bytes) {
            var hex = '';
            for (var i = 0; i < bytes.length; i++) {
                var h = bytes[i].toString(16);
                hex += h.length === 1 ? '0' + h : h;
            }
            return hex;
        }

        // SHA-256 implementation — FIPS 180-4. Works on any UTF-8 string.
        function jsSha256(text) {
            function utf8(str) {
                var out = [];
                for (var i = 0; i < str.length; i++) {
                    var c = str.charCodeAt(i);
                    if (c < 0x80) out.push(c);
                    else if (c < 0x800) {
                        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
                    } else if (c < 0xd800 || c >= 0xe000) {
                        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
                    } else {
                        i++;
                        var u = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                        out.push(0xf0 | (u >> 18), 0x80 | ((u >> 12) & 0x3f),
                                 0x80 | ((u >> 6) & 0x3f), 0x80 | (u & 0x3f));
                    }
                }
                return out;
            }
            function R(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
            var K = [
                0x428a2f98|0,0x71374491|0,0xb5c0fbcf|0,0xe9b5dba5|0,0x3956c25b|0,0x59f111f1|0,0x923f82a4|0,0xab1c5ed5|0,
                0xd807aa98|0,0x12835b01|0,0x243185be|0,0x550c7dc3|0,0x72be5d74|0,0x80deb1fe|0,0x9bdc06a7|0,0xc19bf174|0,
                0xe49b69c1|0,0xefbe4786|0,0x0fc19dc6|0,0x240ca1cc|0,0x2de92c6f|0,0x4a7484aa|0,0x5cb0a9dc|0,0x76f988da|0,
                0x983e5152|0,0xa831c66d|0,0xb00327c8|0,0xbf597fc7|0,0xc6e00bf3|0,0xd5a79147|0,0x06ca6351|0,0x14292967|0,
                0x27b70a85|0,0x2e1b2138|0,0x4d2c6dfc|0,0x53380d13|0,0x650a7354|0,0x766a0abb|0,0x81c2c92e|0,0x92722c85|0,
                0xa2bfe8a1|0,0xa81a664b|0,0xc24b8b70|0,0xc76c51a3|0,0xd192e819|0,0xd6990624|0,0xf40e3585|0,0x106aa070|0,
                0x19a4c116|0,0x1e376c08|0,0x2748774c|0,0x34b0bcb5|0,0x391c0cb3|0,0x4ed8aa4a|0,0x5b9cca4f|0,0x682e6ff3|0,
                0x748f82ee|0,0x78a5636f|0,0x84c87814|0,0x8cc70208|0,0x90befffa|0,0xa4506ceb|0,0xbef9a3f7|0,0xc67178f2|0
            ];
            var H = [0x6a09e667|0,0xbb67ae85|0,0x3c6ef372|0,0xa54ff53a|0,
                     0x510e527f|0,0x9b05688c|0,0x1f83d9ab|0,0x5be0cd19|0];

            var b = utf8(text);
            var bitLen = b.length * 8;
            b.push(0x80);
            while (b.length % 64 !== 56) b.push(0);
            // 64-bit big-endian length. 6-digit PINs fit easily in 32 bits.
            b.push(0, 0, 0, 0);
            b.push((bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff,
                   (bitLen >>> 8) & 0xff, bitLen & 0xff);

            var W = new Array(64);
            for (var off = 0; off < b.length; off += 64) {
                for (var t = 0; t < 16; t++) {
                    W[t] = ((b[off + t * 4] << 24) | (b[off + t * 4 + 1] << 16) |
                            (b[off + t * 4 + 2] << 8) | b[off + t * 4 + 3]) | 0;
                }
                for (t = 16; t < 64; t++) {
                    var s0 = R(W[t-15], 7) ^ R(W[t-15], 18) ^ (W[t-15] >>> 3);
                    var s1 = R(W[t-2], 17) ^ R(W[t-2], 19) ^ (W[t-2] >>> 10);
                    W[t] = (W[t-16] + s0 + W[t-7] + s1) | 0;
                }
                var a = H[0], bb = H[1], c = H[2], d = H[3],
                    e = H[4], f = H[5], g = H[6], h = H[7];
                for (t = 0; t < 64; t++) {
                    var S1 = R(e, 6) ^ R(e, 11) ^ R(e, 25);
                    var ch = (e & f) ^ (~e & g);
                    var t1 = (h + S1 + ch + K[t] + W[t]) | 0;
                    var S0 = R(a, 2) ^ R(a, 13) ^ R(a, 22);
                    var mj = (a & bb) ^ (a & c) ^ (bb & c);
                    var t2 = (S0 + mj) | 0;
                    h = g; g = f; f = e; e = (d + t1) | 0;
                    d = c; c = bb; bb = a; a = (t1 + t2) | 0;
                }
                H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0;
                H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
                H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
                H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
            }

            var out = new Uint8Array(32);
            for (var i = 0; i < 8; i++) {
                out[i*4]     = (H[i] >>> 24) & 0xff;
                out[i*4 + 1] = (H[i] >>> 16) & 0xff;
                out[i*4 + 2] = (H[i] >>> 8) & 0xff;
                out[i*4 + 3] = H[i] & 0xff;
            }
            return toHex(out);
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
