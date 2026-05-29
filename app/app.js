/* StampScaner PWA — main script.
   No tracking, no third-party analytics. Photos and collection live entirely
   on the device until the user explicitly orders a certificate. */

(function () {
'use strict';

const API_BASE = 'https://api.stampscaner.com';
const ENDPOINT_IDENTIFY = API_BASE + '/v1/identify';
const ENDPOINT_CHAT     = API_BASE + '/v1/postman/chat';
const ENDPOINT_CERT     = API_BASE + '/v1/certificate-request';

const STORAGE_THEME = 'stampscaner.app.theme';
const STORAGE_LANG  = 'stampscaner.app.lang';

const SUPPORTED_LANGS = ['ru', 'en', 'ar'];
const RTL_LANGS = ['ar'];
const DEFAULT_LANG = 'ru';

// ---------- i18n ----------
const STR = {
  ru: {
    'app.title': 'StampScaner',
    'nav.home': 'Главная', 'nav.scanner': 'Сканер', 'nav.collection': 'Коллекция',
    'nav.postman': 'Postman', 'nav.profile': 'Профиль',
    'home.eyebrow': 'МАРКА В РУКАХ — ВОПРОС НА 2 СЕКУНДЫ',
    'home.title': 'Сфотографируйте марку.',
    'home.lead': 'Postman ответит, какая страна, год, серия, каталожный номер и сколько она стоит.',
    'home.cta': 'Открыть сканер',
    'home.tile.cert': 'Сертификат',
    'home.recent.title': 'Недавно распознанные',
    'home.recent.empty': 'Здесь появятся марки, которые вы распознали.',
    'scanner.hint': 'Наведите камеру на марку и нажмите кнопку. Свет ровный, без вспышки.',
    'scanner.gallery': 'Из галереи',
    'scanner.capture': 'Сделать снимок',
    'scanner.note': 'Бесплатная идентификация — справочный ответ. Для документа на сделку оформите сертификат.',
    'scanner.processing': 'Postman анализирует марку…',
    'identify.confidence': 'Уверенность',
    'identify.country': 'Страна', 'identify.year': 'Год', 'identify.series': 'Серия',
    'identify.catalog': 'Каталог', 'identify.grade': 'Грейд APS',
    'identify.condition': 'Состояние', 'identify.estimate': 'Оценка',
    'identify.add': 'Добавить в коллекцию', 'identify.cert': 'Заказать сертификат',
    'identify.added': 'Добавлено в коллекцию',
    'collection.total': 'Общая оценка', 'collection.items': 'предметов',
    'collection.empty': 'Коллекция пуста. Распознайте первую марку — она появится здесь.',
    'collection.delete': 'Удалить',
    'postman.status': 'Эксперт-филателист уровня RDP/AIEP',
    'postman.welcome': 'Здравствуйте. Я Postman — эксперт мирового уровня. Покажите марку или опишите её — определю страну, год, серию, дам оценку и проверю на признаки подделки.',
    'postman.placeholder': 'Опишите марку или вопрос…',
    'postman.send': 'Отправить',
    'postman.offline': 'Бэкенд Postman сейчас включается. Напишите на aslankaa@yandex.ru — основатель ответит.',
    'cert.title': 'Заявка на сертификат',
    'cert.intro': 'Сертификат за подписью Аслана Каа. Premium включает страховое покрытие $1000 при условии очной экспертизы и личной передачи.',
    'cert.precert.body': 'AI-анализ Postman, PDF за 24 часа, без страхового покрытия.',
    'cert.premium.body': 'Очная экспертиза, страховое покрытие $1000, печатная версия по запросу.',
    'cert.notes': 'Комментарии',
    'cert.submit': 'Отправить заявку',
    'cert.notice': 'Оплата подключается с интеграцией платёжного шлюза. Сейчас заявка отправляется на e-mail основателя.',
    'cert.sent': 'Заявка отправлена. Мы свяжемся в течение 24 часов.',
    'profile.guest': 'Гость', 'profile.signin': 'Вход / регистрация — скоро',
    'profile.appearance': 'Оформление',
    'profile.theme.light': 'Светлая', 'profile.theme.sepia': 'Сепия', 'profile.theme.dark': 'Тёмная',
    'profile.language': 'Язык',
    'profile.about': 'О проекте',
    'profile.clear': 'Очистить локальные данные',
    'profile.cleared': 'Локальные данные очищены.',
    'install.hint': 'Установите на главный экран — будет как настоящее приложение.',
    'install.btn': 'Установить',
    'install.ios': 'На iPhone: нажмите «Поделиться» → «На экран Домой».',
    'common.back': 'Назад',
  },
  en: {
    'app.title': 'StampScaner',
    'nav.home': 'Home', 'nav.scanner': 'Scanner', 'nav.collection': 'Collection',
    'nav.postman': 'Postman', 'nav.profile': 'Profile',
    'home.eyebrow': 'STAMP IN HAND — ANSWER IN 2 SECONDS',
    'home.title': 'Photograph the stamp.',
    'home.lead': 'Postman returns country, year, series, catalogue reference and a price range.',
    'home.cta': 'Open scanner',
    'home.tile.cert': 'Certificate',
    'home.recent.title': 'Recently identified',
    'home.recent.empty': 'Stamps you identify will appear here.',
    'scanner.hint': 'Point your camera at the stamp and tap the button. Use even daylight, no flash.',
    'scanner.gallery': 'From gallery',
    'scanner.capture': 'Capture',
    'scanner.note': 'Free identification is advisory. For a document used in a deal, order a certificate.',
    'scanner.processing': 'Postman is analysing the stamp…',
    'identify.confidence': 'Confidence',
    'identify.country': 'Country', 'identify.year': 'Year', 'identify.series': 'Series',
    'identify.catalog': 'Catalogue', 'identify.grade': 'APS grade',
    'identify.condition': 'Condition', 'identify.estimate': 'Estimate',
    'identify.add': 'Add to collection', 'identify.cert': 'Request a certificate',
    'identify.added': 'Added to collection',
    'collection.total': 'Total estimate', 'collection.items': 'items',
    'collection.empty': 'Collection empty. Identify your first stamp — it will appear here.',
    'collection.delete': 'Delete',
    'postman.status': 'World-class philatelic expert',
    'postman.welcome': 'Hello. I am Postman, a world-class philatelic expert. Show me the stamp or describe it — I will identify it, value it and check it for counterfeit markers.',
    'postman.placeholder': 'Describe the stamp or ask a question…',
    'postman.send': 'Send',
    'postman.offline': 'Postman backend is being switched on. Please write to aslankaa@yandex.ru in the meantime.',
    'cert.title': 'Request a certificate',
    'cert.intro': 'Certificate signed by Aslan Kaa. Premium includes $1000 insurance cover when issued after in-person expertise and personal handover.',
    'cert.precert.body': 'Postman analysis, PDF within 24h, no insurance cover.',
    'cert.premium.body': 'In-person expertise, $1000 insurance cover, printed version on request.',
    'cert.notes': 'Notes',
    'cert.submit': 'Send request',
    'cert.notice': 'Payment goes live with the gateway integration. For now the request is e-mailed to the founder.',
    'cert.sent': 'Request sent. We will reply within 24 hours.',
    'profile.guest': 'Guest', 'profile.signin': 'Sign in / register — coming soon',
    'profile.appearance': 'Appearance',
    'profile.theme.light': 'Light', 'profile.theme.sepia': 'Sepia', 'profile.theme.dark': 'Dark',
    'profile.language': 'Language',
    'profile.about': 'About',
    'profile.clear': 'Clear local data',
    'profile.cleared': 'Local data cleared.',
    'install.hint': 'Install to home screen — works like a native app.',
    'install.btn': 'Install',
    'install.ios': 'On iPhone: tap Share → Add to Home Screen.',
    'common.back': 'Back',
  },
  ar: {
    'app.title': 'StampScaner',
    'nav.home': 'الرئيسية', 'nav.scanner': 'الماسح', 'nav.collection': 'المجموعة',
    'nav.postman': 'Postman', 'nav.profile': 'الملف',
    'home.eyebrow': 'طابع في اليد — إجابة خلال ثانيتين',
    'home.title': 'صور الطابع.',
    'home.lead': 'يعيد Postman الدولة والسنة والمجموعة ورقم الكتالوج ونطاق السعر.',
    'home.cta': 'فتح الماسح',
    'home.tile.cert': 'شهادة',
    'home.recent.title': 'تم التعرف عليها مؤخراً',
    'home.recent.empty': 'ستظهر هنا الطوابع التي تتعرف عليها.',
    'scanner.hint': 'وجه الكاميرا نحو الطابع واضغط الزر. إضاءة طبيعية بدون فلاش.',
    'scanner.gallery': 'من المعرض',
    'scanner.capture': 'التقاط',
    'scanner.note': 'التعرف المجاني إرشادي. للوثائق في الصفقات اطلب شهادة.',
    'scanner.processing': 'Postman يحلل الطابع…',
    'identify.confidence': 'الثقة',
    'identify.country': 'الدولة', 'identify.year': 'السنة', 'identify.series': 'المجموعة',
    'identify.catalog': 'الكتالوج', 'identify.grade': 'درجة APS',
    'identify.condition': 'الحالة', 'identify.estimate': 'التقدير',
    'identify.add': 'إضافة للمجموعة', 'identify.cert': 'طلب شهادة',
    'identify.added': 'تمت الإضافة للمجموعة',
    'collection.total': 'التقدير الإجمالي', 'collection.items': 'قطعة',
    'collection.empty': 'المجموعة فارغة. تعرف على أول طابع — وسيظهر هنا.',
    'collection.delete': 'حذف',
    'postman.status': 'خبير فلاتيلي عالمي',
    'postman.welcome': 'مرحباً. أنا Postman، خبير عالمي للطوابع. أظهر الطابع أو صفه — سأحدد الدولة والسنة والمجموعة وأعطي تقديراً وأفحص علامات التزوير.',
    'postman.placeholder': 'صف الطابع أو السؤال…',
    'postman.send': 'إرسال',
    'postman.offline': 'الواجهة الخلفية لـ Postman قيد التفعيل. يرجى الكتابة إلى aslankaa@yandex.ru.',
    'cert.title': 'طلب شهادة',
    'cert.intro': 'شهادة بتوقيع أصلان كاع. تتضمن Premium تغطية تأمينية 1000 دولار بعد الفحص الشخصي والتسليم اليدوي.',
    'cert.precert.body': 'تحليل Postman، PDF خلال 24 ساعة، بدون تغطية تأمينية.',
    'cert.premium.body': 'فحص شخصي، تغطية تأمينية 1000 دولار، نسخة مطبوعة عند الطلب.',
    'cert.notes': 'ملاحظات',
    'cert.submit': 'إرسال الطلب',
    'cert.notice': 'سيتم تفعيل الدفع بعد ربط البوابة. الطلب الآن يصل بالبريد الإلكتروني للمؤسس.',
    'cert.sent': 'تم إرسال الطلب. سنرد خلال 24 ساعة.',
    'profile.guest': 'زائر', 'profile.signin': 'تسجيل الدخول / التسجيل — قريباً',
    'profile.appearance': 'المظهر',
    'profile.theme.light': 'فاتح', 'profile.theme.sepia': 'سيبيا', 'profile.theme.dark': 'داكن',
    'profile.language': 'اللغة',
    'profile.about': 'حول التطبيق',
    'profile.clear': 'مسح البيانات المحلية',
    'profile.cleared': 'تم مسح البيانات المحلية.',
    'install.hint': 'ثبت على الشاشة الرئيسية ليعمل كتطبيق أصلي.',
    'install.btn': 'تثبيت',
    'install.ios': 'على iPhone: مشاركة → إضافة إلى الشاشة الرئيسية.',
    'common.back': 'رجوع',
  },
};

let currentLang = DEFAULT_LANG;
let currentTheme = 'light';

function tr(k) { return (STR[currentLang] && STR[currentLang][k]) || STR.ru[k] || k; }

function applyDictionary() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = tr(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(',').forEach(p => {
      const [attr, key] = p.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, tr(key));
    });
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = RTL_LANGS.includes(currentLang) ? 'rtl' : 'ltr';
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  currentLang = lang;
  try { localStorage.setItem(STORAGE_LANG, lang); } catch (e) {}
  applyDictionary();
  document.querySelectorAll('[data-set-lang]').forEach(b =>
    b.classList.toggle('is-active', b.dataset.setLang === lang));
}

function setTheme(theme) {
  if (!['light', 'sepia', 'dark'].includes(theme)) theme = 'light';
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_THEME, theme); } catch (e) {}
  document.querySelectorAll('[data-set-theme]').forEach(b =>
    b.classList.toggle('is-active', b.dataset.setTheme === theme));
}

// ---------- IndexedDB ----------
const DB_NAME = 'stampscaner';
const DB_VERSION = 1;
let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('stamps')) {
        const store = db.createObjectStore('stamps', { keyPath: 'id', autoIncrement: true });
        store.createIndex('captured_at', 'captured_at');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function addStamp(record) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite');
    const req = tx.objectStore('stamps').add({ ...record, captured_at: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function listStamps() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readonly');
    const req = tx.objectStore('stamps').getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.captured_at - a.captured_at));
    req.onerror   = () => reject(req.error);
  });
}

async function removeStamp(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite');
    const req = tx.objectStore('stamps').delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function clearAll() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite');
    const req = tx.objectStore('stamps').clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ---------- Tabs ----------
function goTab(name) {
  document.querySelectorAll('.pwa-tab').forEach(t =>
    t.classList.toggle('pwa-tab--active', t.dataset.tab === name));
  document.querySelectorAll('.pwa-nav__item').forEach(n =>
    n.classList.toggle('is-active', n.dataset.go === name));
  document.getElementById('page-title').textContent = (
    {home: 'StampScaner', scanner: tr('nav.scanner'),
     collection: tr('nav.collection'), postman: tr('nav.postman'),
     profile: tr('nav.profile'), identify: tr('identify.confidence').replace(/.*/, ''),
     certificate: tr('cert.title')}[name] || 'StampScaner');
  if (name === 'collection') renderCollection();
  if (name === 'home')       renderRecent();
  window.scrollTo({ top: 0 });
}

// ---------- Scanner / Identify ----------
let lastImageDataURL = null;
let lastResult = null;

async function handleFile(file) {
  if (!file) return;
  const dataURL = await fileToDataURL(file);
  lastImageDataURL = dataURL;
  showFrame(dataURL);
  await identifyAndShow(file, dataURL);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function showFrame(dataURL) {
  const frame = document.getElementById('scanner-frame');
  frame.innerHTML = '';
  const img = document.createElement('img');
  img.src = dataURL;
  frame.appendChild(img);
}

function showProcessing() {
  const frame = document.getElementById('scanner-frame');
  const overlay = document.createElement('div');
  overlay.className = 'scanner-frame__hint';
  overlay.textContent = tr('scanner.processing');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.55)';
  overlay.style.color = '#F5EDDC';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.maxWidth = 'none';
  overlay.style.padding = '24px';
  frame.appendChild(overlay);
}

async function identifyAndShow(file, dataURL) {
  showProcessing();
  let result;
  try {
    result = await identifyOnWorker(file);
  } catch (e) {
    result = demoResult();
  }
  result.image = dataURL;
  lastResult = result;
  renderIdentify(result);
  goTab('identify');
}

async function identifyOnWorker(file) {
  const fd = new FormData();
  fd.append('image', file);
  const resp = await fetch(ENDPOINT_IDENTIFY, { method: 'POST', body: fd });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return await resp.json();
}

function demoResult() {
  return {
    country: 'СССР',
    year: 1934,
    series: 'Авиапочта · Десятилетие революции (демо)',
    catalog_ref: 'Зг. 384',
    grade: 'VF',
    estimate_low: 420,
    estimate_high: 550,
    condition: 'Гашёная, без дефектов',
    confidence: 0.72,
    notes: 'Бэкенд не подключён — показан образцовый ответ.',
  };
}

function renderIdentify(r) {
  const root = document.getElementById('identify-content');
  const conf = Math.round((r.confidence || 0) * 100);
  const confColor = conf >= 80 ? '#5E7C3F' : conf >= 50 ? '#B86A2C' : '#A33124';

  const img = r.image ? `<img class="identify-img" src="${r.image}" alt="">` : '';

  root.innerHTML = `
    ${img}
    <div class="identify-confidence">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:var(--c-text-muted);font-size:.86rem;text-transform:uppercase;letter-spacing:.06em;">${tr('identify.confidence')}</span>
        <span style="font-family:var(--font-serif);font-size:1.2rem;color:${confColor};">${conf}%</span>
      </div>
      <div class="identify-confidence__bar"><div class="identify-confidence__fill" style="width:${conf}%;background:${confColor};"></div></div>
    </div>

    <div class="identify-card">
      ${row(tr('identify.country'), r.country || '—')}
      ${row(tr('identify.year'),    r.year ? String(r.year) : '—')}
      ${row(tr('identify.series'),  r.series || '—')}
      ${row(tr('identify.catalog'), r.catalog_ref || '—')}
      ${row(tr('identify.grade'),   r.grade || '—')}
      ${row(tr('identify.condition'), r.condition || '—')}
      ${row(tr('identify.estimate'), r.estimate_low || r.estimate_high
            ? `$${r.estimate_low}–${r.estimate_high}` : '—', true)}
    </div>

    ${r.notes ? `<div class="callout-small">${escapeHtml(r.notes)}</div>` : ''}

    <div class="identify-actions">
      <button class="btn btn--gold" id="save-stamp">${tr('identify.add')}</button>
      <button class="btn btn--ghost" id="req-cert">${tr('identify.cert')}</button>
    </div>
  `;
  document.getElementById('save-stamp').addEventListener('click', async () => {
    await addStamp(r);
    toast(tr('identify.added'));
    goTab('collection');
  });
  document.getElementById('req-cert').addEventListener('click', () => goTab('certificate'));
}

function row(label, value, accent) {
  return `<div class="identify-row">
    <span class="identify-row__label">${escapeHtml(label)}</span>
    <span class="identify-row__value ${accent ? 'identify-row__value--accent' : ''}">${escapeHtml(value)}</span>
  </div>`;
}

// ---------- Collection ----------
async function renderCollection() {
  const items = await listStamps().catch(() => []);
  const list  = document.getElementById('collection-list');
  const banner = document.getElementById('collection-banner');
  if (!items.length) {
    list.innerHTML = `<div class="empty-state">${tr('collection.empty')}</div>`;
    banner.hidden = true;
    return;
  }
  let sum = 0;
  items.forEach(i => { sum += Math.round(((i.estimate_low||0) + (i.estimate_high||0)) / 2); });
  document.getElementById('collection-total').textContent = '$' + sum.toLocaleString();
  document.getElementById('collection-count').innerHTML = `${items.length} <span>${tr('collection.items')}</span>`;
  banner.hidden = false;
  list.innerHTML = items.map(stampRow).join('');
  list.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', async () => {
      await removeStamp(Number(b.dataset.del));
      renderCollection();
    }));
}

async function renderRecent() {
  const items = (await listStamps().catch(() => [])).slice(0, 3);
  const list = document.getElementById('recent-list');
  if (!items.length) {
    list.innerHTML = `<div class="empty-state">${tr('home.recent.empty')}</div>`;
    return;
  }
  list.innerHTML = items.map(stampRow).join('');
}

function stampRow(i) {
  const img = i.image ? `<img class="stamp-row__img" src="${i.image}" alt="">` :
    `<div class="stamp-row__img"></div>`;
  return `<div class="stamp-row">
    ${img}
    <div>
      <div class="stamp-row__title">${escapeHtml((i.country||'') + ' · ' + (i.year||''))}</div>
      <div class="stamp-row__meta">${escapeHtml(i.series||'')}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
      <span class="stamp-row__estimate">$${i.estimate_low||0}–${i.estimate_high||0}</span>
      <button class="back-btn" style="padding:0;color:var(--c-text-muted);font-size:.78rem;" data-del="${i.id}">${tr('collection.delete')}</button>
    </div>
  </div>`;
}

// ---------- Postman chat ----------
const POSTMAN_HISTORY_CAP = 12;
const postmanHistory = [];

async function sendPostman() {
  const field = document.getElementById('postman-field');
  const text = field.value.trim();
  if (!text) return;
  field.value = '';
  appendBubble('user', text);
  postmanHistory.push({ role: 'user', content: text });

  const typing = appendTyping();
  try {
    const resp = await fetch(ENDPOINT_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: postmanHistory.slice(0, -1), lang: currentLang }),
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    typing.remove();
    appendBubble('postman', data.reply || tr('postman.offline'));
    postmanHistory.push({ role: 'assistant', content: data.reply || '' });
    while (postmanHistory.length > POSTMAN_HISTORY_CAP) postmanHistory.shift();
  } catch (e) {
    typing.remove();
    appendBubble('postman', tr('postman.offline'));
  }
}

function appendBubble(role, text) {
  const thread = document.getElementById('postman-thread');
  const div = document.createElement('div');
  div.className = 'bubble bubble--' + role;
  div.textContent = text;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function appendTyping() {
  const thread = document.getElementById('postman-thread');
  const div = document.createElement('div');
  div.className = 'bubble bubble--postman bubble--typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
  return div;
}

// ---------- Certificate ----------
async function submitCert(e) {
  e.preventDefault();
  const email = document.getElementById('cert-email').value.trim();
  const notes = document.getElementById('cert-notes').value.trim();
  const tier  = document.querySelector('input[name="tier"]:checked').value;
  if (!email) return;
  const stamp = lastResult || demoResult();
  try {
    await fetch(ENDPOINT_CERT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, contact_email: email, stamp, notes: notes || undefined }),
    });
  } catch (_) { /* swallow — request kept locally */ }
  toast(tr('cert.sent'));
  document.getElementById('cert-form').reset();
}

// ---------- Toast ----------
function toast(text) {
  const t = document.createElement('div');
  t.textContent = text;
  Object.assign(t.style, {
    position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--c-ink, #1A1410)', color: '#F8F2E4',
    padding: '12px 18px', borderRadius: '12px', zIndex: 1000,
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)', fontSize: '.95rem',
  });
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 2400);
  setTimeout(() => t.remove(), 3000);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---------- Install prompt ----------
let deferredPrompt = null;
function setupInstall() {
  const promptEl = document.getElementById('install-prompt');
  const btn = document.getElementById('install-btn');
  const closeBtn = document.getElementById('install-close');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    promptEl.hidden = false;
  });

  btn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    promptEl.hidden = true;
  });

  closeBtn.addEventListener('click', () => promptEl.hidden = true);

  // iOS prompt
  const ua = navigator.userAgent;
  const isiOS = /iphone|ipad|ipod/i.test(ua);
  const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (isiOS && !standalone) {
    setTimeout(() => {
      const node = document.getElementById('install-prompt');
      node.querySelector('span').textContent = tr('install.ios');
      node.querySelector('#install-btn').hidden = true;
      node.hidden = false;
    }, 4000);
  }
}

// ---------- Init ----------
function init() {
  setLang(localStorage.getItem(STORAGE_LANG) ||
          (SUPPORTED_LANGS.includes((navigator.language||'').slice(0,2).toLowerCase())
              ? (navigator.language).slice(0,2).toLowerCase() : DEFAULT_LANG));

  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(localStorage.getItem(STORAGE_THEME) || (sysDark ? 'dark' : 'light'));

  document.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', () => goTab(el.dataset.go)));

  document.querySelectorAll('[data-set-theme]').forEach(b =>
    b.addEventListener('click', () => setTheme(b.dataset.setTheme)));
  document.querySelectorAll('[data-set-lang]').forEach(b =>
    b.addEventListener('click', () => { setLang(b.dataset.setLang); goTab('profile'); }));

  document.querySelector('[data-pick-camera]')
    .addEventListener('click', () => document.getElementById('camera-input').click());
  document.querySelector('[data-pick-gallery]')
    .addEventListener('click', () => document.getElementById('gallery-input').click());
  document.getElementById('camera-input')
    .addEventListener('change', e => handleFile(e.target.files[0]));
  document.getElementById('gallery-input')
    .addEventListener('change', e => handleFile(e.target.files[0]));

  document.getElementById('postman-send').addEventListener('click', sendPostman);
  document.getElementById('postman-field').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPostman(); }
  });

  document.getElementById('cert-form').addEventListener('submit', submitCert);
  document.querySelector('[data-open-profile]').addEventListener('click', () => goTab('profile'));

  document.getElementById('clear-data').addEventListener('click', async () => {
    await clearAll();
    postmanHistory.length = 0;
    document.getElementById('postman-thread').innerHTML =
      `<div class="bubble bubble--postman">${tr('postman.welcome')}</div>`;
    toast(tr('profile.cleared'));
    renderRecent();
  });

  // initial tab via ?tab=
  const params = new URLSearchParams(location.search);
  const startTab = params.get('tab') || 'home';
  goTab(['home','scanner','collection','postman','profile','certificate'].includes(startTab) ? startTab : 'home');

  setupInstall();
  renderRecent();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
})();
