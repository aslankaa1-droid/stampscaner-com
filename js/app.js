/* ============================================================
   StampScaner — front-end app
   © Кагиров Абдул-Хаким Ахмадович (Аслан Каа), 2026
   No tracking, no third-party analytics, no forms collecting PII without consent.
   ============================================================ */

(function () {
    'use strict';

    const STORAGE_LANG = 'stampscaner.lang';
    const STORAGE_THEME = 'stampscaner.theme';
    const STORAGE_CURRENCY = 'stampscaner.currency';

    const DEFAULT_LANG = 'ru';
    const DEFAULT_THEME = 'light';
    const DEFAULT_CURRENCY = 'usd';

    const SUPPORTED_LANGS = ['ru', 'en', 'ar'];
    const RTL_LANGS = ['ar'];

    let dictionary = {};
    let currentLang = DEFAULT_LANG;
    let currentTheme = DEFAULT_THEME;
    let currentCurrency = DEFAULT_CURRENCY;

    // --------- Helpers ---------
    function safeGetStorage(key, fallback) {
        try {
            return localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function safeSetStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // ignore if storage not available (private mode, etc.)
        }
    }

    // --------- i18n ---------
    async function loadDictionary(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
        try {
            const resp = await fetch(`i18n/${lang}.json`, { cache: 'no-store' });
            if (!resp.ok) throw new Error('Dictionary not found');
            dictionary = await resp.json();
            currentLang = lang;
            applyDictionary();
            applyDirection();
            safeSetStorage(STORAGE_LANG, lang);
            document.documentElement.lang = lang;
        } catch (e) {
            console.error('Failed to load dictionary for', lang, e);
            if (lang !== DEFAULT_LANG) loadDictionary(DEFAULT_LANG);
        }
    }

    function applyDictionary() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const value = dictionary[key];
            if (typeof value !== 'string') return;

            // Preserve newlines (\n) as <br> for multi-line strings
            if (value.includes('\n')) {
                el.innerHTML = value.split('\n').map(escapeHtml).join('<br>');
            } else {
                el.textContent = value;
            }
        });

        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            // Format: "attrName:i18nKey,attrName2:i18nKey2"
            const spec = el.dataset.i18nAttr;
            spec.split(',').forEach(pair => {
                const [attr, key] = pair.split(':').map(s => s.trim());
                if (!attr || !key) return;
                const value = dictionary[key];
                if (typeof value === 'string') {
                    el.setAttribute(attr, value);
                }
            });
        });

        // Update <title> and <meta description>
        if (dictionary['meta.title']) document.title = dictionary['meta.title'];
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dictionary['meta.description']) {
            metaDesc.setAttribute('content', dictionary['meta.description']);
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function applyDirection() {
        const isRTL = RTL_LANGS.includes(currentLang);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.body.classList.toggle('is-rtl', isRTL);
    }

    // --------- Theme ---------
    function applyTheme(theme) {
        const valid = ['light', 'dark', 'sepia'];
        if (!valid.includes(theme)) theme = DEFAULT_THEME;
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        safeSetStorage(STORAGE_THEME, theme);
        const select = document.querySelector('[data-theme-select]');
        if (select) select.value = theme;
    }

    function cycleTheme() {
        const order = ['light', 'sepia', 'dark'];
        const idx = order.indexOf(currentTheme);
        const next = order[(idx + 1) % order.length];
        applyTheme(next);
    }

    // --------- Currency ---------
    function applyCurrency(currency) {
        if (!['usd', 'rub'].includes(currency)) currency = DEFAULT_CURRENCY;
        currentCurrency = currency;
        safeSetStorage(STORAGE_CURRENCY, currency);

        document.querySelectorAll('[data-price-card]').forEach(card => {
            const usdEl = card.querySelector('[data-currency="usd"]');
            const rubEl = card.querySelector('[data-currency="rub"]');
            if (!usdEl || !rubEl) return;
            usdEl.hidden = currency !== 'usd';
            rubEl.hidden = currency !== 'rub';
        });

        document.querySelectorAll('[data-pricing-toggle]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pricingToggle === currency);
        });
    }

    // --------- Mobile nav toggle ---------
    function setupMobileNav() {
        const toggle = document.querySelector('[data-mobile-toggle]');
        const nav = document.querySelector('[data-nav]');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
        // Close on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => nav.classList.remove('is-open'));
        });
    }

    // --------- Init ---------
    function init() {
        // Language: stored > browser > default
        const stored = safeGetStorage(STORAGE_LANG, '');
        const browserLang = (navigator.language || 'ru').slice(0, 2).toLowerCase();
        const initial = stored || (SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG);
        loadDictionary(initial);

        // Theme
        const storedTheme = safeGetStorage(STORAGE_THEME, '');
        const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(storedTheme || (sysDark ? 'dark' : DEFAULT_THEME));

        // Currency
        const storedCurrency = safeGetStorage(STORAGE_CURRENCY, '');
        applyCurrency(storedCurrency || DEFAULT_CURRENCY);

        // Wire up controls
        const langSelect = document.querySelector('[data-lang-select]');
        if (langSelect) {
            langSelect.value = currentLang;
            langSelect.addEventListener('change', e => loadDictionary(e.target.value));
        }

        const themeSelect = document.querySelector('[data-theme-select]');
        if (themeSelect) {
            themeSelect.addEventListener('change', e => applyTheme(e.target.value));
        }

        const themeBtn = document.querySelector('[data-theme-cycle]');
        if (themeBtn) themeBtn.addEventListener('click', cycleTheme);

        document.querySelectorAll('[data-pricing-toggle]').forEach(btn => {
            btn.addEventListener('click', () => applyCurrency(btn.dataset.pricingToggle));
        });

        setupMobileNav();

        // Smooth fade-up reveal on scroll
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-up');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
        }

        // Postman chat — real fetch to backend Worker, graceful fallback.
        setupPostmanChat();
    }

    // --------- Postman chat ---------
    const POSTMAN_API = 'https://stampscaner-backend.aslankaa1.workers.dev/v1/postman/chat';
    const POSTMAN_HISTORY_CAP = 12;
    const postmanHistory = [];

    function setupPostmanChat() {
        const sendBtn = document.querySelector('[data-postman-send]');
        const field   = document.querySelector('.chat-preview__field');
        const inputRow = document.querySelector('.chat-preview__input');
        const card    = document.querySelector('.chat-preview');
        if (!sendBtn || !field || !inputRow || !card) return;

        const send = (e) => {
            e && e.preventDefault();
            const text = field.value.trim();
            if (!text) return;
            field.value = '';
            appendBubble(inputRow, 'user', text);
            postmanHistory.push({ role: 'user', content: text });

            const typing = appendTyping(inputRow);
            askPostman(text).then(reply => {
                typing.remove();
                appendBubble(inputRow, 'postman', reply);
                postmanHistory.push({ role: 'assistant', content: reply });
                while (postmanHistory.length > POSTMAN_HISTORY_CAP) {
                    postmanHistory.shift();
                }
            }).catch(err => {
                typing.remove();
                appendBubble(inputRow, 'postman', offlineMessage());
                console.warn('Postman fetch failed:', err);
            });
        };

        sendBtn.addEventListener('click', send);
        field.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) send(e);
        });
    }

    function appendBubble(beforeNode, who, text) {
        const div = document.createElement('div');
        div.className = 'chat-preview__msg chat-preview__msg--' + who;
        div.textContent = text;
        beforeNode.parentNode.insertBefore(div, beforeNode);
        beforeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function appendTyping(beforeNode) {
        const div = document.createElement('div');
        div.className = 'chat-preview__msg chat-preview__msg--postman';
        div.setAttribute('aria-live', 'polite');
        div.innerHTML = '<span class="chat-typing"><span></span><span></span><span></span></span>';
        beforeNode.parentNode.insertBefore(div, beforeNode);
        return div;
    }

    async function askPostman(text) {
        const resp = await fetch(POSTMAN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: postmanHistory.slice(0, -1), // last entry is the user msg we just pushed
                lang: currentLang,
            }),
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        if (typeof data.reply !== 'string') throw new Error('No reply field');
        return data.reply;
    }

    function offlineMessage() {
        return dictionary['postman.offline'] || (
            currentLang === 'ar'
                ? 'الواجهة الخلفية لـ Postman قيد التفعيل. يرجى الكتابة عبر البريد aslankaa@yandex.ru.'
                : currentLang === 'en'
                    ? 'The Postman backend is being switched on. Please write to aslankaa@yandex.ru in the meantime.'
                    : 'Бэкенд Postman сейчас включается. Напишите на aslankaa@yandex.ru — основатель ответит.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
